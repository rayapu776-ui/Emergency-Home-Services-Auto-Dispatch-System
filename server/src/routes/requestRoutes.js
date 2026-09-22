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
          latitude = 28.6139,
          longitude = 77.209,
          service_name,
          service_slug,
          service_image,
          scheduled_date,
          scheduled_time,
          price,
          total_paid,
          payment_method,
        } = req.body;

        if (!category && !service_name) {
          return res.status(400).json({
            error: "Category or service name is required",
          });
        }

        const requestId = `AY-${Math.floor(10000 + Math.random() * 90000)}`;
        const customerId = req.user.id;
        const bookingDesc =
          description ||
          `Service booking for ${service_name || "Doorstep Service"}`;

        // Find best certified technician for this category
        let tech = await query.get(
          `SELECT t.*, u.name, u.phone, u.avatar
           FROM technicians t
           JOIN users u ON t.user_id = u.id
           WHERE t.category = ?
           ORDER BY t.rating DESC LIMIT 1`,
          [category],
        );
        if (!tech) {
          tech = await query.get(
            `SELECT t.*, u.name, u.phone, u.avatar
             FROM technicians t
             JOIN users u ON t.user_id = u.id
             ORDER BY t.rating DESC LIMIT 1`,
          );
        }

        const techId = tech ? tech.id : null;
        const initialStatus = techId ? "ASSIGNED" : "REQUESTED";

        await query.run(
          `INSERT INTO service_requests (
            id, customer_id, technician_id, category, priority, description, address, latitude, longitude,
            status, service_name, service_slug, service_image, scheduled_date, scheduled_time, price, total_paid, payment_method
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            requestId,
            customerId,
            techId,
            category || "Doorstep Service",
            priority,
            bookingDesc,
            address ||
              "Flat 402, Green Glen Heights, Sector 62, Noida, Uttar Pradesh",
            latitude,
            longitude,
            initialStatus,
            service_name || "Doorstep Service",
            service_slug || "service",
            service_image ||
              "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=85",
            scheduled_date || "Today",
            scheduled_time || "Priority Slot",
            price || "$29.00",
            total_paid || "$32.50",
            payment_method || "UPI",
          ],
        );

        await query.run(
          `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
           VALUES (?, ?, NULL, ?, 'Booking created and confirmed.')`,
          [uuidv4(), requestId, initialStatus],
        );

        // Generate Real Notifications for Customer
        try {
          await query.run(
            `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
             VALUES (?, ?, ?, ?, 'booking', 1)`,
            [
              uuidv4(),
              customerId,
              `Booking Confirmed: ${service_name || "Doorstep Service"}`,
              `Your booking #${requestId} is confirmed for ${scheduled_date || "Today"} (${scheduled_time || "Priority Slot"}).`,
            ],
          );

          if (tech) {
            await query.run(
              `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
               VALUES (?, ?, ?, ?, 'dispatch', 1)`,
              [
                uuidv4(),
                customerId,
                `Service Provider Assigned: ${tech.name}`,
                `${tech.name} (${tech.phone || "+91 98101 11223"}) has been assigned to your booking #${requestId}.`,
              ],
            );

            if (tech.user_id) {
              await query.run(
                `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
                 VALUES (?, ?, ?, ?, 'dispatch', 1)`,
                [
                  uuidv4(),
                  tech.user_id,
                  `New Job Dispatched: #${requestId}`,
                  `You have a new booking for ${service_name || "Doorstep Service"} at ${address || "Customer Address"}.`,
                ],
              );
            }
          }
        } catch (notifErr) {
          console.warn("Notification insert error:", notifErr);
        }

        // Notify Admin room of new booking
        io.to("role_admin").emit("new_emergency_alert", {
          requestId,
          category: category || "General",
          priority,
          address: address || "Customer Address",
          customerName: req.user.name,
        });

        const created = {
          id: requestId,
          orderId: requestId,
          serviceName: service_name || "Doorstep Service",
          category: category || "Doorstep Service",
          image:
            service_image ||
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=85",
          slug: service_slug || "service",
          scheduledDate: scheduled_date || "Today",
          scheduledTime: scheduled_time || "Priority Slot",
          status: "Confirmed",
          statusStep: 2,
          price: price || "$29.00",
          totalPaid: total_paid || "$32.50",
          paymentMethod: payment_method || "UPI",
          address: address || "Customer Address",
          rating: null,
          feedback: null,
          technician: tech
            ? {
                id: tech.id,
                name: tech.name || "Rajesh Kumar",
                phone: tech.phone || "+91 98101 11223",
                rating: String(tech.rating || "4.9"),
                reviews: String(tech.total_jobs || "142"),
                experience: "7 years",
                avatar:
                  tech.avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
              }
            : null,
        };

        res.status(201).json(created);
      } catch (err) {
        console.error("Create request error:", err);
        res.status(500).json({ error: "Failed to create service booking" });
      }
    },
  );

  // Get current user's requests (Customer sees their requests, Technician sees assigned/active jobs)
  router.get("/my", authenticateToken, async (req, res) => {
    try {
      let requests = [];
      if (req.user.role === "customer") {
        const rows = await query.all(
          `SELECT sr.*, 
                  t.vehicle_type, t.latitude as tech_lat, t.longitude as tech_lon,
                  tu.name as technician_name, tu.phone as technician_phone, tu.avatar as technician_avatar,
                  t.rating as technician_rating, t.total_jobs as technician_jobs
           FROM service_requests sr
           LEFT JOIN technicians t ON sr.technician_id = t.id
           LEFT JOIN users tu ON t.user_id = tu.id
           WHERE sr.customer_id = ?
           ORDER BY sr.created_at DESC`,
          [req.user.id],
        );

        requests = rows.map((sr) => {
          const isCompleted = sr.status === "COMPLETED";
          const isCancelled = sr.status === "CANCELLED";
          const isInProgress =
            sr.status === "IN_PROGRESS" ||
            sr.status === "ON_THE_WAY" ||
            sr.status === "ARRIVED";

          const statusDisplay = isCompleted
            ? "Completed"
            : isCancelled
              ? "Cancelled"
              : isInProgress
                ? "In Progress"
                : "Confirmed";

          const statusStep = isCompleted
            ? 4
            : isInProgress
              ? 3
              : isCancelled
                ? 1
                : 2;

          return {
            id: sr.id,
            orderId: sr.id,
            serviceName: sr.service_name || sr.description,
            category: sr.category || "Doorstep Service",
            image:
              sr.service_image ||
              "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=85",
            slug: sr.service_slug || "service",
            scheduledDate: sr.scheduled_date || "Today",
            scheduledTime: sr.scheduled_time || "Priority Slot",
            status: statusDisplay,
            statusStep: statusStep,
            price: sr.price || "$29.00",
            totalPaid: sr.total_paid || "$32.50",
            paymentMethod: sr.payment_method || "UPI",
            address: sr.address,
            rating: sr.rating,
            feedback: sr.feedback,
            createdAt: sr.created_at,
            technician: sr.technician_id
              ? {
                  id: sr.technician_id,
                  name: sr.technician_name || "Rajesh Kumar",
                  phone: sr.technician_phone || "+91 98101 11223",
                  rating: String(sr.technician_rating || "4.9"),
                  reviews: String(sr.technician_jobs || "142"),
                  experience: "7 years",
                  avatar:
                    sr.technician_avatar ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                }
              : null,
          };
        });
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
        return res.status(403).json({
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

        // Notify technician user
        try {
          const techUser = await query.get(
            `SELECT user_id FROM technicians WHERE id = ?`,
            [reqRecord.technician_id],
          );
          if (techUser?.user_id) {
            await query.run(
              `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
               VALUES (?, ?, ?, ?, 'rating', 1)`,
              [
                uuidv4(),
                techUser.user_id,
                `New Customer Rating: ★ ${numRating}`,
                feedback
                  ? `Customer feedback for #${req.params.id}: "${feedback}"`
                  : `Customer left a ★ ${numRating} rating for #${req.params.id}.`,
              ],
            );
          }
        } catch (notifErr) {
          console.warn("Rating notification error:", notifErr);
        }

        io.emit("request_updated", {
          id: req.params.id,
          rating: numRating,
          technicianId: reqRecord.technician_id,
        });
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
        return res.status(403).json({
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

  // Mark service request as completed
  router.post("/:id/complete", authenticateToken, async (req, res) => {
    try {
      const currentReq = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      if (!currentReq)
        return res.status(404).json({ error: "Request not found" });

      await query.run(
        `UPDATE service_requests SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [req.params.id],
      );

      if (currentReq.technician_id) {
        await query.run(
          `UPDATE technicians SET is_busy = 0, total_jobs = total_jobs + 1, current_request_id = NULL WHERE id = ?`,
          [currentReq.technician_id],
        );
      }

      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, ?, 'COMPLETED', 'Service fulfilled and completed.')`,
        [uuidv4(), req.params.id, currentReq.status],
      );

      try {
        await query.run(
          `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
           VALUES (?, ?, ?, ?, 'completed', 1)`,
          [
            uuidv4(),
            currentReq.customer_id,
            `Service Completed: #${req.params.id}`,
            `Your service has been successfully completed. Tap to rate your professional.`,
          ],
        );
      } catch {}

      io.to(`request_${req.params.id}`).emit("request_updated", {
        id: req.params.id,
        status: "COMPLETED",
      });

      res.json({ success: true, message: "Service marked completed" });
    } catch (err) {
      res.status(500).json({ error: "Failed to complete service request" });
    }
  });

  // Reschedule service request
  router.post("/:id/reschedule", authenticateToken, async (req, res) => {
    try {
      const { scheduledDate, scheduledTime } = req.body;
      const currentReq = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      if (!currentReq)
        return res.status(404).json({ error: "Request not found" });

      await query.run(
        `UPDATE service_requests SET scheduled_date = ?, scheduled_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [
          scheduledDate || "Tomorrow",
          scheduledTime || "10:00 AM",
          req.params.id,
        ],
      );

      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.params.id,
          currentReq.status,
          currentReq.status,
          `Booking rescheduled to ${scheduledDate} (${scheduledTime})`,
        ],
      );

      try {
        await query.run(
          `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
           VALUES (?, ?, ?, ?, 'booking', 1)`,
          [
            uuidv4(),
            currentReq.customer_id,
            `Booking Rescheduled: #${req.params.id}`,
            `Your booking has been rescheduled to ${scheduledDate} (${scheduledTime}).`,
          ],
        );
      } catch {}

      res.json({ success: true, message: "Booking rescheduled successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to reschedule booking" });
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
