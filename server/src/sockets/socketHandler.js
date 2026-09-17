import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { calculateDistance, calculateETA } from "../utils/geo.js";
import { dispatchEngine } from "../services/dispatchEngine.js";

export function setupSockets(io) {
  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join specific rooms
    socket.on("join_room", ({ room }) => {
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });

    socket.on("leave_room", ({ room }) => {
      socket.leave(room);
      console.log(`[Socket] ${socket.id} left room: ${room}`);
    });

    // Technician accepts dispatch
    socket.on("technician_accept_offer", async ({ requestId, techId }) => {
      try {
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
    socket.on(
      "technician_decline_offer",
      async ({ requestId, techId, reason }) => {
        try {
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
        }
      },
    );

    // Technician broadcasts live GPS location
    socket.on(
      "technician_location_update",
      async ({ techId, requestId, latitude, longitude }) => {
        try {
          // Update tech position in DB
          await query.run(
            `UPDATE technicians SET latitude = ?, longitude = ? WHERE id = ?`,
            [latitude, longitude, techId],
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
                latitude,
                longitude,
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
            latitude,
            longitude,
            requestId,
            distanceKm: remainingDistance,
            etaMinutes: updatedEta,
          });
        } catch (err) {
          console.error("Error updating technician location:", err);
        }
      },
    );

    // Technician updates active job lifecycle status
    socket.on(
      "update_request_status",
      async ({ requestId, newStatus, note, techId }) => {
        try {
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
            "SELECT * FROM service_requests WHERE id = ?",
            [requestId],
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
            const activeTechId = techId || currentReq.technician_id;
            if (activeTechId) {
              await query.run(
                `UPDATE technicians 
               SET is_busy = 0, current_request_id = NULL, total_jobs = total_jobs + 1 
               WHERE id = ?`,
                [activeTechId],
              );
            }
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
      },
    );

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}
