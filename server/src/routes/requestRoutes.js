import express from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import { dispatchEngine } from "../services/dispatchEngine.js";

export default function createRequestRouter(io) {
  const router = express.Router();

  // Create new emergency service request
  router.post(
    "/",
    authenticateToken,
    requireRole("customer"),
    async (req, res) => {
      try {
        const {
          category,
          priority = "High",
          description,
          address,
          latitude,
          longitude,
        } = req.body;

        if (
          !category ||
          !description ||
          !address ||
          latitude === undefined ||
          longitude === undefined
        ) {
          return res.status(400).json({
            error:
              "Category, description, address, and coordinates are required",
          });
        }

        const requestId = uuidv4();
        const customerId = req.user.id;

        await query.run(
          `INSERT INTO service_requests (id, customer_id, category, priority, description, address, latitude, longitude, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'REQUESTED')`,
          [
            requestId,
            customerId,
            category,
            priority,
            description,
            address,
            latitude,
            longitude,
          ],
        );

        await query.run(
          `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, NULL, 'REQUESTED', 'Emergency request logged. Scanning nearest available certified units.')`,
          [uuidv4(), requestId],
        );

        // Notify Admin room of new incoming emergency
        io.to("role_admin").emit("new_emergency_alert", {
          requestId,
          category,
          priority,
          address,
          customerName: req.user.name,
        });

        // Immediately initiate auto-dispatch engine
        dispatchEngine.autoDispatch(requestId, io).catch((err) => {
          console.error("Background dispatch error:", err);
        });

        const created = await query.get(
          `SELECT sr.*, u.name as customer_name, u.phone as customer_phone
         FROM service_requests sr
         JOIN users u ON sr.customer_id = u.id
         WHERE sr.id = ?`,
          [requestId],
        );

        res.status(201).json(created);
      } catch (err) {
        console.error("Create request error:", err);
        res.status(500).json({ error: "Failed to create emergency request" });
      }
    },
  );

  // Get current user's requests (Customer sees their requests, Technician sees assigned/active jobs)
  router.get("/my", authenticateToken, async (req, res) => {
    try {
      let requests = [];
      if (req.user.role === "customer") {
        requests = await query.all(
          `SELECT sr.*, 
                  t.vehicle_type, t.latitude as tech_lat, t.longitude as tech_lon,
                  tu.name as technician_name, tu.phone as technician_phone, t.rating as technician_rating
           FROM service_requests sr
           LEFT JOIN technicians t ON sr.technician_id = t.id
           LEFT JOIN users tu ON t.user_id = tu.id
           WHERE sr.customer_id = ?
           ORDER BY sr.created_at DESC`,
          [req.user.id],
        );
      } else if (req.user.role === "technician") {
        const tech = await query.get(
          "SELECT id FROM technicians WHERE user_id = ?",
          [req.user.id],
        );
        if (!tech) return res.json([]);

        requests = await query.all(
          `SELECT sr.*, u.name as customer_name, u.phone as customer_phone
           FROM service_requests sr
           JOIN users u ON sr.customer_id = u.id
           WHERE sr.technician_id = ?
           ORDER BY sr.created_at DESC`,
          [tech.id],
        );
      } else if (req.user.role === "admin") {
        requests = await query.all(
          `SELECT sr.*, u.name as customer_name, u.phone as customer_phone,
                  tu.name as technician_name, tu.phone as technician_phone
           FROM service_requests sr
           JOIN users u ON sr.customer_id = u.id
           LEFT JOIN technicians t ON sr.technician_id = t.id
           LEFT JOIN users tu ON t.user_id = tu.id
           ORDER BY sr.created_at DESC`,
        );
      }
      res.json(requests);
    } catch (err) {
      console.error("Fetch my requests error:", err);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // Get single request details by ID with full status logs & technician details
  router.get("/:id", authenticateToken, async (req, res) => {
    try {
      const request = await query.get(
        `SELECT sr.*, 
                cu.name as customer_name, cu.phone as customer_phone, cu.email as customer_email,
                t.vehicle_type, t.latitude as tech_lat, t.longitude as tech_lon, t.rating as technician_rating,
                tu.name as technician_name, tu.phone as technician_phone, tu.email as technician_email
         FROM service_requests sr
         JOIN users cu ON sr.customer_id = cu.id
         LEFT JOIN technicians t ON sr.technician_id = t.id
         LEFT JOIN users tu ON t.user_id = tu.id
         WHERE sr.id = ?
           AND (
             sr.customer_id = ?
             OR ? = 'admin'
             OR EXISTS (
               SELECT 1 FROM technicians own_t
               WHERE own_t.user_id = ? AND own_t.id = sr.technician_id
             )
           )`,
        [req.params.id, req.user.id, req.user.role, req.user.id],
      );

      if (!request) return res.status(404).json({ error: "Request not found" });

      const logs = await query.all(
        "SELECT * FROM status_logs WHERE request_id = ? ORDER BY timestamp ASC",
        [req.params.id],
      );

      res.json({
        ...request,
        logs,
      });
    } catch (err) {
      console.error("Fetch request detail error:", err);
      res.status(500).json({ error: "Failed to fetch request detail" });
    }
  });

  // Rate completed service request
  router.post("/:id/rate", authenticateToken, async (req, res) => {
    try {
      const { rating, feedback } = req.body;
      const numRating = Number(rating);
      if (!numRating || numRating < 1 || numRating > 5) {
        return res
          .status(400)
          .json({ error: "Valid rating between 1 and 5 required" });
      }

      const reqRecord = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      if (!reqRecord)
        return res.status(404).json({ error: "Request not found" });

      if (req.user.role !== "admin" && reqRecord.customer_id !== req.user.id) {
        return res
          .status(403)
          .json({
            error: "Only the customer or an admin can rate this request",
          });
      }

      await query.run(
        `UPDATE service_requests SET rating = ?, feedback = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [numRating, feedback || null, req.params.id],
      );

      // Recalculate technician average rating
      if (reqRecord.technician_id) {
        const avgRow = await query.get(
          `SELECT AVG(rating) as avg_rating FROM service_requests WHERE technician_id = ? AND rating IS NOT NULL`,
          [reqRecord.technician_id],
        );
        if (avgRow && avgRow.avg_rating) {
          await query.run(
            `UPDATE technicians SET rating = ROUND(?, 2) WHERE id = ?`,
            [avgRow.avg_rating, reqRecord.technician_id],
          );
        }
      }

      res.json({
        success: true,
        message: "Rating recorded. Thank you for your feedback!",
      });
    } catch (err) {
      console.error("Rating error:", err);
      res.status(500).json({ error: "Failed to record rating" });
    }
  });

  // Cancel service request
  router.post("/:id/cancel", authenticateToken, async (req, res) => {
    try {
      const currentReq = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      if (!currentReq)
        return res.status(404).json({ error: "Request not found" });

      if (req.user.role !== "admin" && currentReq.customer_id !== req.user.id) {
        return res
          .status(403)
          .json({
            error: "Only the customer or an admin can cancel this request",
          });
      }

      await query.run(
        `UPDATE service_requests SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [req.params.id],
      );

      if (currentReq.technician_id) {
        await query.run(
          `UPDATE technicians SET is_busy = 0, current_request_id = NULL WHERE id = ?`,
          [currentReq.technician_id],
        );
      }

      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, ?, 'CANCELLED', 'Request cancelled by user.')`,
        [uuidv4(), req.params.id, currentReq.status],
      );

      io.to(`request_${req.params.id}`).emit("request_updated", {
        id: req.params.id,
        status: "CANCELLED",
      });

      res.json({ success: true, message: "Request cancelled" });
    } catch (err) {
      res.status(500).json({ error: "Failed to cancel request" });
    }
  });

  // Retrigger Auto-Dispatch (if previously unfulfilled)
  router.post(
    "/:id/auto-dispatch",
    authenticateToken,
    requireRole("admin"),
    async (req, res) => {
      try {
        const result = await dispatchEngine.autoDispatch(req.params.id, io);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Dispatch retry failed" });
      }
    },
  );

  return router;
}
