import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { calculateDistance, calculateETA } from "../utils/geo.js";
import { dispatchEngine } from "../services/dispatchEngine.js";
import { verifySocketToken } from "../middleware/auth.js";

export function setupSockets(io) {
  const getAuthorizedTechnician = async (
    socket,
    requestedTechId,
    requestId,
  ) => {
    const user = await verifySocketToken(socket.data.authToken);
    if (!user || user.role !== "technician") return null;

    const tech = await query.get(
      `SELECT t.id, t.status FROM technicians t
       JOIN users u ON u.id = t.user_id
       WHERE t.user_id = ? AND u.account_status = 'Active'`,
      [user.id],
    );
    if (!tech || tech.id !== requestedTechId || tech.status !== "Approved") {
      return null;
    }

    if (requestId) {
      const request = await query.get(
        "SELECT technician_id, status FROM service_requests WHERE id = ?",
        [requestId],
      );
      if (
        !request ||
        request.technician_id !== tech.id ||
        ["COMPLETED", "CANCELLED"].includes(request.status)
      ) {
        return null;
      }
    }
    return { user, tech };
  };

  io.on("connection", (socket) => {
    // Join specific rooms
    socket.on("join_room", async (payload = {}) => {
      try {
        const { room, token } = payload || {};
        const user = await verifySocketToken(token);
        if (!user || typeof room !== "string") {
          socket.emit("socket_room_denied", { room });
          return;
        }

        let permitted =
          room === `user_${user.id}` || room === `role_${user.role}`;
        if (room === "role_admin") {
          permitted =
            user.role === "admin" &&
            ["super_admin", "operations_admin"].includes(user.adminRole);
        }
        if (room.startsWith("request_")) {
          const requestId = room.slice("request_".length);
          const request = await query.get(
            "SELECT customer_id, technician_id FROM service_requests WHERE id = ?",
            [requestId],
          );
          if (user.role === "admin") {
            permitted = Boolean(request);
          } else if (user.role === "customer") {
            permitted = request?.customer_id === user.id;
          } else if (user.role === "technician") {
            const technician = await query.get(
              "SELECT id FROM technicians WHERE user_id = ?",
              [user.id],
            );
            permitted = Boolean(
              technician && request?.technician_id === technician.id,
            );
          }
        }

        if (!permitted) {
          socket.emit("socket_room_denied", { room });
          return;
        }
        socket.data.user = user;
        socket.data.authToken = token;
        socket.join(room);
      } catch (err) {
        console.error("Socket room authorization error:", err);
        socket.emit("socket_room_denied", { room: payload?.room });
      }
    });

    socket.on("leave_room", (payload = {}) => {
      if (typeof payload?.room === "string") socket.leave(payload.room);
    });

    // Technician accepts dispatch
    socket.on("technician_accept_offer", async (payload = {}) => {
      const { requestId, techId } = payload || {};
      try {
        const authorized = await getAuthorizedTechnician(
          socket,
          techId,
          requestId,
        );
        if (!authorized)
          throw new Error(
            "This dispatch offer is not assigned to your account.",
          );
        const result = await dispatchEngine.handleAccept(requestId, techId, io);
        socket.emit("offer_response_acknowledged", {
          success: true,
          request: result.request,
        });
      } catch (err) {
        console.error("Error accepting dispatch:", err);
        socket.emit("offer_response_acknowledged", {
          success: false,
          error: err.message,
        });
      }
    });

    // Technician declines dispatch
    socket.on("technician_decline_offer", async (payload = {}) => {
      const { requestId, techId, reason } = payload || {};
      try {
        const authorized = await getAuthorizedTechnician(
          socket,
          techId,
          requestId,
        );
        if (!authorized)
          throw new Error(
            "This dispatch offer is not assigned to your account.",
          );
        await dispatchEngine.handleDeclineOrTimeout(
          requestId,
          techId,
          io,
          reason || "Declined by technician",
        );
        socket.emit("offer_response_acknowledged", {
          success: true,
          declined: true,
        });
      } catch (err) {
        console.error("Error declining dispatch:", err);
        socket.emit("offer_response_acknowledged", {
          success: false,
          error: err.message,
        });
      }
    });

    // Technician broadcasts live GPS location
    socket.on("technician_location_update", async (payload = {}) => {
      const { techId, requestId, latitude, longitude } = payload || {};
      try {
        const authorized = await getAuthorizedTechnician(
          socket,
          techId,
          requestId,
        );
        const lat = Number(latitude);
        const lon = Number(longitude);
        if (
          !authorized ||
          !Number.isFinite(lat) ||
          lat < -90 ||
          lat > 90 ||
          !Number.isFinite(lon) ||
          lon < -180 ||
          lon > 180
        ) {
          socket.emit("location_update_error", {
            message:
              "Location update is not authorized or coordinates are invalid.",
          });
          return;
        }
        // Update tech position in DB
        await query.run(
          `UPDATE technicians SET latitude = ?, longitude = ? WHERE id = ?`,
          [lat, lon, techId],
        );

        let remainingDistance = null;
        let updatedEta = null;

        if (requestId) {
          const req = await query.get(
            "SELECT latitude, longitude, priority FROM service_requests WHERE id = ?",
            [requestId],
          );
          if (req) {
            remainingDistance = calculateDistance(
              lat,
              lon,
              req.latitude,
              req.longitude,
            );
            updatedEta = calculateETA(remainingDistance, req.priority);

            await query.run(
              `UPDATE service_requests SET distance_km = ?, eta_minutes = ? WHERE id = ?`,
              [remainingDistance, updatedEta, requestId],
            );

            // Broadcast to customer room
            io.to(`request_${requestId}`).emit("technician_moved", {
              techId,
              latitude,
              longitude,
              distanceKm: remainingDistance,
              etaMinutes: updatedEta,
            });
          }
        }

        // Broadcast to Admin live control room
        io.to("role_admin").emit("admin_tech_moved", {
          techId,
          latitude: lat,
          longitude: lon,
          requestId,
          distanceKm: remainingDistance,
          etaMinutes: updatedEta,
        });
      } catch (err) {
        console.error("Error updating technician location:", err);
      }
    });

    // Technician updates active job lifecycle status
    socket.on("update_request_status", async (payload = {}) => {
      const { requestId, newStatus, note, techId } = payload || {};
      try {
        const authorized = await getAuthorizedTechnician(
          socket,
          techId,
          requestId,
        );
        if (!authorized) {
          return socket.emit("status_update_error", {
            message: "This booking is not assigned to your account.",
          });
        }
        const validStatuses = [
          "ACCEPTED",
          "ON_THE_WAY",
          "ARRIVED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
        ];
        if (!validStatuses.includes(newStatus)) {
          return socket.emit("status_update_error", {
            message: "Invalid status",
          });
        }

        const currentReq = await query.get(
          "SELECT * FROM service_requests WHERE id = ? AND technician_id = ?",
          [requestId, authorized.tech.id],
        );
        if (!currentReq) return;

        await query.run(
          `UPDATE service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [newStatus, requestId],
        );

        await query.run(
          `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
           VALUES (?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            requestId,
            currentReq.status,
            newStatus,
            note || `Status advanced to ${newStatus}`,
          ],
        );

        // If completed or cancelled, free up technician
        if (newStatus === "COMPLETED" || newStatus === "CANCELLED") {
          await query.run(
            `UPDATE technicians SET is_busy = 0, current_request_id = NULL,
                 total_jobs = total_jobs + ? WHERE id = ? AND current_request_id = ?`,
            [newStatus === "COMPLETED" ? 1 : 0, authorized.tech.id, requestId],
          );
        }

        const updatedRequest = await query.get(
          `SELECT sr.*, u.name as customer_name, u.phone as customer_phone,
                  t.vehicle_type, t.latitude as tech_lat, t.longitude as tech_lon,
                  tu.name as technician_name, tu.phone as technician_phone, t.rating as technician_rating
           FROM service_requests sr
           JOIN users u ON sr.customer_id = u.id
           LEFT JOIN technicians t ON sr.technician_id = t.id
           LEFT JOIN users tu ON t.user_id = tu.id
           WHERE sr.id = ?`,
          [requestId],
        );

        io.to(`request_${requestId}`).emit("request_updated", updatedRequest);
        io.to("role_admin").emit("admin_dispatch_event", {
          type: "STATUS_TRANSITION",
          request: updatedRequest,
          oldStatus: currentReq.status,
          newStatus,
        });
      } catch (err) {
        console.error("Error updating status:", err);
      }
    });

    socket.on("disconnect", () => {
      socket.data.user = null;
      socket.data.authToken = null;
    });
  });
}
