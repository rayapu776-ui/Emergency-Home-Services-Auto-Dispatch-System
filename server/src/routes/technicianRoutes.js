import express from "express";
import { query } from "../db/database.js";
import { authenticateToken } from "../middleware/auth.js";

export default function createTechnicianRouter(io) {
  const router = express.Router();

  // Get all technicians (for map and admin workforce monitor)
  router.get("/", authenticateToken, async (req, res) => {
    try {
      const technicians = await query.all(
        `SELECT t.*, u.name, u.email, u.phone, u.avatar,
                sr.category as active_category, sr.priority as active_priority, sr.address as active_address
         FROM technicians t
         JOIN users u ON t.user_id = u.id
         LEFT JOIN service_requests sr ON t.current_request_id = sr.id
         ORDER BY t.is_online DESC, t.rating DESC`,
      );
      res.json(technicians);
    } catch (err) {
      console.error("Error fetching technicians:", err);
      res.status(500).json({ error: "Failed to fetch technicians" });
    }
  });

  // Get currently logged-in technician's profile & active job
  router.get("/current-status", authenticateToken, async (req, res) => {
    try {
      const tech = await query.get(
        `SELECT t.*, u.name, u.email, u.phone, u.avatar
         FROM technicians t
         JOIN users u ON t.user_id = u.id
         WHERE t.user_id = ?`,
        [req.user.id],
      );

      if (!tech)
        return res.status(404).json({ error: "Technician profile not found" });

      let activeJob = null;
      if (tech.current_request_id) {
        activeJob = await query.get(
          `SELECT sr.*, u.name as customer_name, u.phone as customer_phone
           FROM service_requests sr
           JOIN users u ON sr.customer_id = u.id
           WHERE sr.id = ?`,
          [tech.current_request_id],
        );
      }

      res.json({ technician: tech, activeJob });
    } catch (err) {
      res.status(500).json({ error: "Failed to get technician status" });
    }
  });

  // Toggle availability (online/offline)
  router.put("/availability", authenticateToken, async (req, res) => {
    try {
      const { is_online } = req.body;
      const tech = await query.get(
        "SELECT id FROM technicians WHERE user_id = ?",
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      await query.run("UPDATE technicians SET is_online = ? WHERE id = ?", [
        is_online ? 1 : 0,
        tech.id,
      ]);

      // Broadcast update to Admin Control Room
      io.to("role_admin").emit("technician_status_changed", {
        techId: tech.id,
        is_online: is_online ? 1 : 0,
      });

      res.json({ success: true, is_online: is_online ? 1 : 0 });
    } catch (err) {
      res.status(500).json({ error: "Failed to update availability" });
    }
  });

  // Update current GPS coordinates
  router.put("/location", authenticateToken, async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const tech = await query.get(
        "SELECT id FROM technicians WHERE user_id = ?",
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      await query.run(
        "UPDATE technicians SET latitude = ?, longitude = ? WHERE id = ?",
        [latitude, longitude, tech.id],
      );

      res.json({ success: true, latitude, longitude });
    } catch (err) {
      res.status(500).json({ error: "Failed to update coordinates" });
    }
  });

  return router;
}
