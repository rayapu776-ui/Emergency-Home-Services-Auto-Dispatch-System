import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { requireAdminPermission } from "../middleware/auth.js";
import { dispatchEngine } from "../services/dispatchEngine.js";

const activeStatuses = [
  "REQUESTED",
  "AUTO_DISPATCHED",
  "ASSIGNED",
  "ACCEPTED",
  "ON_THE_WAY",
  "ARRIVED",
  "IN_PROGRESS",
];

async function recordAction(req, action, targetType, targetId, previous, next) {
  await query.run(
    `INSERT INTO admin_activity
      (id, admin_id, admin_name, action, target_type, target_id, previous_value, new_value)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      req.user.id,
      req.user.name || req.user.email,
      action,
      targetType,
      targetId || null,
      previous == null ? null : JSON.stringify(previous),
      next == null ? null : JSON.stringify(next),
    ],
  );
}

export default function createAdminManagementRouter(io) {
  const router = express.Router();

  router.get(
    "/dashboard",
    requireAdminPermission("dashboard.read"),
    async (_req, res) => {
      try {
        const count = async (sql) => (await query.get(sql))?.count || 0;
        const [
          customers,
          professionals,
          onlineProfessionals,
          pendingApprovals,
          activeJobs,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          recentBookings,
          bookingTrend,
        ] = await Promise.all([
          count("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'"),
          count("SELECT COUNT(*) AS count FROM technicians"),
          count(
            "SELECT COUNT(*) AS count FROM technicians WHERE is_online = 1",
          ),
          count(
            "SELECT COUNT(*) AS count FROM technicians WHERE status = 'Pending Verification'",
          ),
          count(
            "SELECT COUNT(*) AS count FROM service_requests WHERE status IN ('ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')",
          ),
          count(
            "SELECT COUNT(*) AS count FROM service_requests WHERE status IN ('REQUESTED', 'AUTO_DISPATCHED')",
          ),
          count(
            "SELECT COUNT(*) AS count FROM service_requests WHERE status IN ('ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')",
          ),
          count(
            "SELECT COUNT(*) AS count FROM service_requests WHERE status = 'COMPLETED'",
          ),
          count(
            "SELECT COUNT(*) AS count FROM service_requests WHERE status = 'CANCELLED'",
          ),
          query.all(`SELECT sr.id, sr.service_name, sr.category, sr.scheduled_date, sr.scheduled_time,
                          sr.address, sr.price, sr.status, sr.created_at,
                          cu.name AS customer_name, tu.name AS technician_name
                   FROM service_requests sr
                   JOIN users cu ON cu.id = sr.customer_id
                   LEFT JOIN technicians t ON t.id = sr.technician_id
                   LEFT JOIN users tu ON tu.id = t.user_id
                   ORDER BY sr.created_at DESC LIMIT 10`),
          query.all(`SELECT date(created_at) AS period, COUNT(*) AS bookings,
                          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                          SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
                   FROM service_requests
                   WHERE date(created_at) >= date('now', '-29 day')
                   GROUP BY date(created_at) ORDER BY period`),
        ]);

        res.json({
          counts: {
            customers,
            professionals,
            onlineProfessionals,
            offlineProfessionals: Math.max(
              0,
              professionals - onlineProfessionals,
            ),
            pendingApprovals,
            activeJobs,
            pendingBookings,
            confirmedBookings,
            completedBookings,
            cancelledBookings,
          },
          recentBookings: [
            "super_admin",
            "operations_admin",
            "support_admin",
          ].includes(_req.user.adminRole)
            ? recentBookings
            : [],
          bookingTrend,
          revenueAvailable: false,
          paymentsAvailable: false,
          complaintsAvailable: false,
        });
      } catch (err) {
        console.error("Admin dashboard error:", err);
        res.status(500).json({ error: "Failed to load dashboard records." });
      }
    },
  );

  router.get(
    "/customers",
    requireAdminPermission("customers.read"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.address, u.created_at, u.account_status,
                COUNT(sr.id) AS total_bookings,
                SUM(CASE WHEN sr.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_bookings,
                SUM(CASE WHEN sr.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_bookings
         FROM users u LEFT JOIN service_requests sr ON sr.customer_id = u.id
         WHERE u.role = 'customer'
         GROUP BY u.id ORDER BY u.created_at DESC`,
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin customers error:", err);
        res.status(500).json({ error: "Failed to load customers." });
      }
    },
  );

  router.put(
    "/customers/:id/status",
    requireAdminPermission("customers.manage"),
    async (req, res) => {
      try {
        const { status } = req.body;
        if (!["Active", "Suspended"].includes(status))
          return res
            .status(400)
            .json({ error: "Status must be Active or Suspended." });
        const customer = await query.get(
          "SELECT id, account_status FROM users WHERE id = ? AND role = 'customer'",
          [req.params.id],
        );
        if (!customer)
          return res.status(404).json({ error: "Customer not found." });
        await query.run("UPDATE users SET account_status = ? WHERE id = ?", [
          status,
          customer.id,
        ]);
        await recordAction(
          req,
          `Customer account ${status.toLowerCase()}`,
          "customer",
          customer.id,
          customer.account_status,
          status,
        );
        res.json({ success: true, account_status: status });
      } catch (err) {
        console.error("Customer status update error:", err);
        res.status(500).json({ error: "Failed to update customer status." });
      }
    },
  );

  router.get(
    "/professionals",
    requireAdminPermission("professionals.read"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          `SELECT t.id, t.user_id, u.name, u.email, u.phone, u.avatar, u.account_status,
                u.address, t.category, t.service_areas, t.is_online, t.is_busy, t.status,
                t.experience_years, t.rating, t.total_jobs, t.account_type,
                COALESCE((SELECT SUM(p.amount) FROM technician_payouts p WHERE p.technician_id = t.id), 0) AS recorded_earnings
         FROM technicians t JOIN users u ON u.id = t.user_id
         ORDER BY t.status = 'Pending Verification' DESC, u.created_at DESC`,
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin professionals error:", err);
        res.status(500).json({ error: "Failed to load professionals." });
      }
    },
  );

  router.get(
    "/verification",
    requireAdminPermission("verification.manage"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          `SELECT t.id, t.user_id, u.name, u.email, u.phone, t.category, t.account_type,
                t.status, t.id_document_type, t.id_document_url,
                t.business_registration_number, t.verification_notes,
                CASE WHEN (t.account_type = 'company' AND COALESCE(TRIM(t.business_registration_number), '') <> '')
                       OR (COALESCE(t.account_type, 'individual') <> 'company' AND COALESCE(TRIM(t.id_document_url), '') <> '')
                     THEN 1 ELSE 0 END AS has_required_documents
         FROM technicians t JOIN users u ON u.id = t.user_id
         WHERE t.status IN ('Pending Verification', 'Needs Correction', 'Rejected')
         ORDER BY u.created_at ASC`,
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Verification queue error:", err);
        res.status(500).json({ error: "Failed to load verification queue." });
      }
    },
  );

  router.put(
    "/professionals/:id/verification",
    requireAdminPermission("verification.manage"),
    async (req, res) => {
      try {
        const { status, notes = "" } = req.body;
        if (!["Approved", "Rejected", "Needs Correction"].includes(status))
          return res
            .status(400)
            .json({ error: "Unsupported verification status." });
        const tech = await query.get(
          `SELECT t.id, t.status, t.account_type, t.id_document_url, t.business_registration_number
         FROM technicians t JOIN users u ON u.id = t.user_id WHERE t.id = ? AND u.role = 'technician'`,
          [req.params.id],
        );
        if (!tech)
          return res.status(404).json({ error: "Professional not found." });
        const hasDocument =
          tech.account_type === "company"
            ? Boolean(tech.business_registration_number?.trim())
            : Boolean(tech.id_document_url?.trim());
        if (status === "Approved" && !hasDocument)
          return res
            .status(400)
            .json({
              error:
                "A submitted identity or business-document reference is required before approval.",
            });
        await query.run(
          "UPDATE technicians SET status = ?, verification_notes = ? WHERE id = ?",
          [status, notes.trim() || null, tech.id],
        );
        await recordAction(
          req,
          `Professional verification ${status.toLowerCase()}`,
          "professional",
          tech.id,
          tech.status,
          status,
        );
        const user = await query.get(
          "SELECT user_id FROM technicians WHERE id = ?",
          [tech.id],
        );
        io.to(`user_${user.user_id}`).emit(
          "professional_verification_updated",
          { technicianId: tech.id, status },
        );
        res.json({ success: true, status });
      } catch (err) {
        console.error("Professional verification error:", err);
        res
          .status(500)
          .json({ error: "Failed to update professional verification." });
      }
    },
  );

  router.put(
    "/professionals/:id/status",
    requireAdminPermission("professionals.manage"),
    async (req, res) => {
      try {
        const { status } = req.body;
        if (!["Active", "Suspended"].includes(status))
          return res
            .status(400)
            .json({ error: "Status must be Active or Suspended." });
        const professional = await query.get(
          `SELECT u.id, u.account_status FROM users u JOIN technicians t ON t.user_id = u.id WHERE t.id = ? AND u.role = 'technician'`,
          [req.params.id],
        );
        if (!professional)
          return res.status(404).json({ error: "Professional not found." });
        await query.run("UPDATE users SET account_status = ? WHERE id = ?", [
          status,
          professional.id,
        ]);
        if (status === "Suspended")
          await query.run(
            "UPDATE technicians SET is_online = 0 WHERE user_id = ?",
            [professional.id],
          );
        await recordAction(
          req,
          `Professional account ${status.toLowerCase()}`,
          "professional",
          req.params.id,
          professional.account_status,
          status,
        );
        io.to("role_admin").emit("technician_status_changed", {
          techId: req.params.id,
          account_status: status,
        });
        res.json({ success: true, account_status: status });
      } catch (err) {
        console.error("Professional account update error:", err);
        res
          .status(500)
          .json({ error: "Failed to update professional account." });
      }
    },
  );

  router.get(
    "/bookings",
    requireAdminPermission("bookings.read"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          `SELECT sr.id, sr.customer_id, sr.technician_id, sr.service_name, sr.category,
                sr.scheduled_date, sr.scheduled_time, sr.address, sr.latitude, sr.longitude,
                sr.price, sr.total_paid, sr.payment_method, sr.status, sr.created_at, sr.updated_at,
                cu.name AS customer_name, cu.phone AS customer_phone,
                tu.name AS technician_name, t.latitude AS technician_latitude, t.longitude AS technician_longitude,
                t.is_online AS technician_online
         FROM service_requests sr JOIN users cu ON cu.id = sr.customer_id
         LEFT JOIN technicians t ON t.id = sr.technician_id LEFT JOIN users tu ON tu.id = t.user_id
         ORDER BY sr.created_at DESC`,
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin bookings error:", err);
        res.status(500).json({ error: "Failed to load bookings." });
      }
    },
  );

  router.put(
    "/bookings/:id/status",
    requireAdminPermission("bookings.manage"),
    async (req, res) => {
      try {
        if (req.body.status !== "CANCELLED")
          return res
            .status(400)
            .json({
              error:
                "Admin status changes are currently limited to cancellation.",
            });
        const booking = await query.get(
          "SELECT id, status, technician_id, customer_id FROM service_requests WHERE id = ?",
          [req.params.id],
        );
        if (!booking)
          return res.status(404).json({ error: "Booking not found." });
        if (["COMPLETED", "CANCELLED"].includes(booking.status))
          return res
            .status(409)
            .json({ error: "This booking is already closed." });
        await query.run(
          "UPDATE service_requests SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [booking.id],
        );
        await query.run(
          "INSERT INTO status_logs (id, request_id, old_status, new_status, note) VALUES (?, ?, ?, 'CANCELLED', ?)",
          [
            uuidv4(),
            booking.id,
            booking.status,
            `Cancelled by admin ${req.user.name || req.user.id}.`,
          ],
        );
        if (booking.technician_id)
          await query.run(
            "UPDATE technicians SET is_busy = 0, current_request_id = NULL WHERE id = ? AND current_request_id = ?",
            [booking.technician_id, booking.id],
          );
        await recordAction(
          req,
          "Booking cancelled",
          "booking",
          booking.id,
          booking.status,
          "CANCELLED",
        );
        io.to(`request_${booking.id}`).emit("request_updated", {
          id: booking.id,
          status: "CANCELLED",
        });
        io.to(`user_${booking.customer_id}`).emit("booking_status_updated", {
          requestId: booking.id,
          status: "CANCELLED",
        });
        io.to("role_admin").emit("admin_dispatch_event", {
          type: "BOOKING_CANCELLED",
          request: { id: booking.id },
        });
        res.json({ success: true, status: "CANCELLED" });
      } catch (err) {
        console.error("Admin booking update error:", err);
        res.status(500).json({ error: "Failed to update booking." });
      }
    },
  );

  router.get(
    "/dispatch",
    requireAdminPermission("dispatch.manage"),
    async (_req, res) => {
      try {
        const unassigned = await query.all(
          `SELECT sr.id, sr.category, sr.service_name, sr.priority, sr.address, sr.latitude,
          sr.longitude, sr.status, sr.created_at, sr.technician_id,
          u.name AS customer_name, tu.name AS technician_name
         FROM service_requests sr JOIN users u ON u.id = sr.customer_id
         LEFT JOIN technicians t ON t.id = sr.technician_id
         LEFT JOIN users tu ON tu.id = t.user_id
         WHERE sr.status IN ('REQUESTED', 'AUTO_DISPATCHED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')
         ORDER BY CASE sr.priority WHEN 'Critical' THEN 0 WHEN 'High' THEN 1 ELSE 2 END, sr.created_at`,
        );
        const rows = await Promise.all(
          unassigned.map(async (request) => ({
            ...request,
            candidates: await dispatchEngine.findEligibleTechnicians(
              request.category,
              request.latitude,
              request.longitude,
            ),
          })),
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin dispatch queue error:", err);
        res.status(500).json({ error: "Failed to load dispatch queue." });
      }
    },
  );

  router.post(
    "/manual-dispatch",
    requireAdminPermission("dispatch.manage"),
    async (req, res) => {
      try {
        const { requestId, technicianId } = req.body;
        const booking = await query.get(
          "SELECT * FROM service_requests WHERE id = ?",
          [requestId],
        );
        if (!booking || !activeStatuses.includes(booking.status))
          return res.status(404).json({ error: "Active booking not found." });
        const eligible = await dispatchEngine.findEligibleTechnicians(
          booking.category,
          booking.latitude,
          booking.longitude,
        );
        if (!eligible.some((technician) => technician.id === technicianId))
          return res
            .status(409)
            .json({
              error: "Professional is no longer eligible for this booking.",
            });
        const result = await dispatchEngine.manualAssign(
          requestId,
          technicianId,
          io,
          req.user.name,
        );
        if (booking.technician_id && booking.technician_id !== technicianId) {
          const oldTech = await query.get(
            "SELECT user_id FROM technicians WHERE id = ?",
            [booking.technician_id],
          );
          await query.run(
            "UPDATE technicians SET is_busy = 0, current_request_id = NULL WHERE id = ? AND current_request_id = ?",
            [booking.technician_id, requestId],
          );
          if (oldTech)
            io.to(`user_${oldTech.user_id}`).emit("booking_reassigned", {
              requestId,
            });
        }
        await recordAction(
          req,
          "Professional assigned to booking",
          "booking",
          requestId,
          booking.technician_id,
          technicianId,
        );
        res.json(result);
      } catch (err) {
        console.error("Manual dispatch error:", err);
        res.status(500).json({ error: "Failed to assign professional." });
      }
    },
  );

  router.get(
    "/earnings",
    requireAdminPermission("earnings.read"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          `SELECT t.id, u.name, t.category, t.total_jobs AS completed_jobs,
                COALESCE(SUM(p.amount), 0) AS paid_out,
                COALESCE(SUM(CASE WHEN p.status = 'Pending' THEN p.amount ELSE 0 END), 0) AS pending_payout
         FROM technicians t JOIN users u ON u.id = t.user_id
         LEFT JOIN technician_payouts p ON p.technician_id = t.id
         GROUP BY t.id ORDER BY paid_out DESC`,
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin earnings error:", err);
        res.status(500).json({ error: "Failed to load payout records." });
      }
    },
  );

  router.get(
    "/payments",
    requireAdminPermission("earnings.read"),
    (_req, res) => {
      res.json({
        available: false,
        total: 0,
        rows: [],
        message:
          "The current database has no payment transaction ledger. Booking payment method and amounts are not proof of a settled payment.",
      });
    },
  );

  router.get(
    "/reviews",
    requireAdminPermission("reviews.read"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          `SELECT sr.id AS booking_id, sr.rating, sr.feedback, sr.review_hidden, sr.updated_at,
                sr.service_name, sr.category, cu.id AS customer_id, cu.name AS customer_name,
                tu.id AS professional_id, tu.name AS professional_name
         FROM service_requests sr
         JOIN users cu ON cu.id = sr.customer_id
         LEFT JOIN technicians t ON t.id = sr.technician_id
         LEFT JOIN users tu ON tu.id = t.user_id
         WHERE sr.rating IS NOT NULL OR COALESCE(TRIM(sr.feedback), '') <> ''
         ORDER BY sr.updated_at DESC`,
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin reviews error:", err);
        res.status(500).json({ error: "Failed to load customer reviews." });
      }
    },
  );

  router.put(
    "/reviews/:bookingId/moderation",
    requireAdminPermission("reviews.manage"),
    async (req, res) => {
      try {
        const hidden = req.body.hidden;
        if (typeof hidden !== "boolean")
          return res
            .status(400)
            .json({ error: "hidden must be true or false." });
        const review = await query.get(
          "SELECT id, review_hidden FROM service_requests WHERE id = ? AND (rating IS NOT NULL OR COALESCE(TRIM(feedback), '') <> '')",
          [req.params.bookingId],
        );
        if (!review)
          return res.status(404).json({ error: "Review not found." });
        await query.run(
          "UPDATE service_requests SET review_hidden = ? WHERE id = ?",
          [hidden ? 1 : 0, review.id],
        );
        await recordAction(
          req,
          hidden ? "Review hidden" : "Review restored",
          "review",
          review.id,
          review.review_hidden,
          hidden ? 1 : 0,
        );
        res.json({ success: true, hidden });
      } catch (err) {
        console.error("Review moderation error:", err);
        res.status(500).json({ error: "Failed to update review moderation." });
      }
    },
  );

  router.get(
    "/notifications",
    requireAdminPermission("notifications.read"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          `SELECT n.id, n.user_id, u.name AS user_name, u.role AS user_role,
                n.title, n.description, n.type, n.unread, n.created_at
         FROM user_notifications n JOIN users u ON u.id = n.user_id
         ORDER BY n.created_at DESC LIMIT 500`,
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin notifications error:", err);
        res.status(500).json({ error: "Failed to load user notifications." });
      }
    },
  );

  router.get(
    "/notification-recipients",
    requireAdminPermission("notifications.send"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          "SELECT id, name, email, role FROM users WHERE role IN ('customer', 'technician') AND account_status = 'Active' ORDER BY name",
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin notification recipients error:", err);
        res
          .status(500)
          .json({ error: "Failed to load notification recipients." });
      }
    },
  );

  router.post(
    "/notifications",
    requireAdminPermission("notifications.send"),
    async (req, res) => {
      try {
        const {
          audience,
          userIds = [],
          title,
          description,
          type = "announcement",
        } = req.body;
        const validTypes = [
          "booking",
          "payment",
          "service",
          "emergency",
          "announcement",
          "verification",
          "promotion",
        ];
        if (
          !String(title || "").trim() ||
          !String(description || "").trim() ||
          !validTypes.includes(type)
        ) {
          return res
            .status(400)
            .json({
              error:
                "A title, message, and supported notification type are required.",
            });
        }

        let recipients;
        if (audience === "selected") {
          if (
            !Array.isArray(userIds) ||
            userIds.length === 0 ||
            userIds.length > 500
          )
            return res
              .status(400)
              .json({ error: "Choose at least one recipient (up to 500)." });
          const placeholders = userIds.map(() => "?").join(",");
          recipients = await query.all(
            `SELECT id FROM users WHERE id IN (${placeholders}) AND role IN ('customer', 'technician') AND account_status = 'Active'`,
            userIds,
          );
          if (recipients.length !== new Set(userIds).size)
            return res
              .status(400)
              .json({
                error: "One or more recipients are invalid or inactive.",
              });
        } else {
          const roles =
            audience === "customers"
              ? ["customer"]
              : audience === "professionals"
                ? ["technician"]
                : audience === "all"
                  ? ["customer", "technician"]
                  : null;
          if (!roles)
            return res
              .status(400)
              .json({
                error:
                  "Choose all, customers, professionals, or selected recipients.",
              });
          recipients = await query.all(
            `SELECT id FROM users WHERE role IN (${roles.map(() => "?").join(",")}) AND account_status = 'Active'`,
            roles,
          );
        }

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();
        for (const recipient of recipients) {
          const id = uuidv4();
          const notification = {
            id,
            user_id: recipient.id,
            title: cleanTitle,
            description: cleanDescription,
            type,
            unread: 1,
            created_at: new Date().toISOString(),
          };
          await query.run(
            `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
           VALUES (?, ?, ?, ?, ?, 1)`,
            [id, recipient.id, cleanTitle, cleanDescription, type],
          );
          io.to(`user_${recipient.id}`).emit("user_notification", notification);
        }
        await recordAction(
          req,
          "Notification sent",
          "notification",
          null,
          null,
          { audience, count: recipients.length, title: cleanTitle },
        );
        res.status(201).json({ success: true, sent: recipients.length });
      } catch (err) {
        console.error("Admin notification send error:", err);
        res.status(500).json({ error: "Failed to send notification." });
      }
    },
  );

  router.get(
    "/settings",
    requireAdminPermission("admin.users.manage"),
    async (req, res) => {
      try {
        const administrators = await query.all(
          "SELECT id, name, email, admin_role, account_status, created_at FROM users WHERE role = 'admin' ORDER BY created_at",
        );
        res.json({
          currentRole: req.user.adminRole,
          roles: [
            "super_admin",
            "operations_admin",
            "support_admin",
            "finance_admin",
            "content_admin",
          ],
          administrators,
        });
      } catch (err) {
        console.error("Admin settings error:", err);
        res
          .status(500)
          .json({ error: "Failed to load administrator settings." });
      }
    },
  );

  router.post(
    "/administrators",
    requireAdminPermission("admin.users.manage"),
    async (req, res) => {
      try {
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "")
          .trim()
          .toLowerCase();
        const password = String(req.body.password || "");
        const adminRole = req.body.adminRole;
        const allowedRoles = [
          "operations_admin",
          "support_admin",
          "finance_admin",
          "content_admin",
          "super_admin",
        ];
        if (
          !name ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
          password.length < 12 ||
          !allowedRoles.includes(adminRole)
        ) {
          return res
            .status(400)
            .json({
              error:
                "Provide a name, valid email, password of at least 12 characters, and supported admin role.",
            });
        }
        const existing = await query.get(
          "SELECT id FROM users WHERE LOWER(email) = ?",
          [email],
        );
        if (existing)
          return res
            .status(409)
            .json({ error: "An account with that email already exists." });
        const id = uuidv4();
        await query.run(
          `INSERT INTO users (id, name, email, password_hash, role, account_status, admin_role)
         VALUES (?, ?, ?, ?, 'admin', 'Active', ?)`,
          [id, name, email, bcrypt.hashSync(password, 12), adminRole],
        );
        await recordAction(
          req,
          "Administrator account created",
          "admin",
          id,
          null,
          { email, adminRole },
        );
        res
          .status(201)
          .json({
            success: true,
            administrator: {
              id,
              name,
              email,
              adminRole,
              account_status: "Active",
            },
          });
      } catch (err) {
        console.error("Admin account creation error:", err);
        res
          .status(500)
          .json({ error: "Failed to create administrator account." });
      }
    },
  );

  router.get(
    "/activity",
    requireAdminPermission("activity.read"),
    async (_req, res) => {
      try {
        const rows = await query.all(
          "SELECT * FROM admin_activity ORDER BY created_at DESC LIMIT 500",
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin activity error:", err);
        res.status(500).json({ error: "Failed to load activity log." });
      }
    },
  );

  router.get(
    "/analytics",
    requireAdminPermission("analytics.read"),
    async (req, res) => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const range = req.query.range || "30d";
        let startDate = today;
        let endDate = today;
        if (range === "7d" || range === "30d") {
          const days = range === "7d" ? 6 : 29;
          startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10);
        } else if (range === "custom") {
          startDate = String(req.query.start || "");
          endDate = String(req.query.end || "");
          const validDate = (value) =>
            /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
          if (
            !validDate(startDate) ||
            !validDate(endDate) ||
            startDate > endDate
          ) {
            return res
              .status(400)
              .json({ error: "Choose a valid custom start and end date." });
          }
        } else if (range !== "today") {
          return res
            .status(400)
            .json({ error: "Range must be today, 7d, 30d, or custom." });
        }

        const [bookingRows, accountRows] = await Promise.all([
          query.all(
            `SELECT date(sr.created_at) AS period, COUNT(sr.id) AS bookings,
                SUM(CASE WHEN sr.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN sr.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
         FROM service_requests sr
         WHERE date(sr.created_at) BETWEEN ? AND ?
         GROUP BY date(sr.created_at) ORDER BY period`,
            [startDate, endDate],
          ),
          query.all(
            `SELECT date(created_at) AS period,
                SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) AS new_customers,
                SUM(CASE WHEN role = 'technician' THEN 1 ELSE 0 END) AS new_professionals
         FROM users WHERE role IN ('customer', 'technician')
           AND date(created_at) BETWEEN ? AND ?
         GROUP BY date(created_at) ORDER BY period`,
            [startDate, endDate],
          ),
        ]);
        const byDate = new Map();
        for (const row of bookingRows)
          byDate.set(row.period, {
            period: row.period,
            bookings: row.bookings,
            completed: row.completed,
            cancelled: row.cancelled,
            new_customers: 0,
            new_professionals: 0,
          });
        for (const row of accountRows) {
          const current = byDate.get(row.period) || {
            period: row.period,
            bookings: 0,
            completed: 0,
            cancelled: 0,
            new_customers: 0,
            new_professionals: 0,
          };
          current.new_customers = row.new_customers;
          current.new_professionals = row.new_professionals;
          byDate.set(row.period, current);
        }
        const rows = [...byDate.values()].sort((a, b) =>
          a.period.localeCompare(b.period),
        );
        res.json({ total: rows.length, rows });
      } catch (err) {
        console.error("Admin analytics error:", err);
        res.status(500).json({ error: "Failed to load analytics." });
      }
    },
  );

  router.get(
    "/workforce",
    requireAdminPermission("professionals.read"),
    async (_req, res) => {
      try {
        const roster = await query.all(
          `SELECT t.*, u.name, u.email, u.phone, u.avatar, u.account_status,
                sr.category AS active_job_category, sr.priority AS active_job_priority, sr.address AS active_job_address
         FROM technicians t JOIN users u ON t.user_id = u.id
         LEFT JOIN service_requests sr ON t.current_request_id = sr.id
         ORDER BY t.is_online DESC, t.is_busy DESC`,
        );
        res.json(roster);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch workforce roster." });
      }
    },
  );

  router.put(
    "/technicians/:id/toggle",
    requireAdminPermission("professionals.manage"),
    async (req, res) => {
      try {
        const tech = await query.get(
          `SELECT t.is_online, t.status, u.account_status FROM technicians t JOIN users u ON u.id = t.user_id WHERE t.id = ?`,
          [req.params.id],
        );
        if (!tech)
          return res.status(404).json({ error: "Professional not found." });
        if (tech.account_status !== "Active" || tech.status !== "Approved")
          return res
            .status(409)
            .json({
              error:
                "Only active, approved professionals can be made available.",
            });
        const is_online = tech.is_online ? 0 : 1;
        await query.run("UPDATE technicians SET is_online = ? WHERE id = ?", [
          is_online,
          req.params.id,
        ]);
        await recordAction(
          req,
          `Professional marked ${is_online ? "online" : "offline"}`,
          "professional",
          req.params.id,
          tech.is_online,
          is_online,
        );
        io.to("role_admin").emit("technician_status_changed", {
          techId: req.params.id,
          is_online,
        });
        res.json({ success: true, is_online });
      } catch (err) {
        res
          .status(500)
          .json({ error: "Failed to update professional availability." });
      }
    },
  );

  return router;
}
