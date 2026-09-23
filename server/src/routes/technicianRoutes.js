import express from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { calculateDistance } from "../utils/geo.js";

export default function createTechnicianRouter(io) {
  const router = express.Router();

  // Helper to parse currency/amounts to pure number
  const parseAmount = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/[^0-9.]/g, "");
    return parseFloat(clean) || 0;
  };

  // Helper to create technician notification & emit realtime event
  const notifyTechnician = async (userId, title, description, type = "dispatch") => {
    try {
      const notifId = uuidv4();
      await query.run(
        `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [notifId, userId, title, description, type]
      );
      if (io) {
        io.to(`user_${userId}`).emit("technician_notification", {
          id: notifId,
          user_id: userId,
          title,
          description,
          type,
          unread: 1,
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("Error creating technician notification:", e);
    }
  };

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

  // Comprehensive Technician Dashboard Summary
  router.get("/dashboard-summary", authenticateToken, async (req, res) => {
    try {
      const tech = await query.get(
        `SELECT t.*, u.name, u.email, u.phone, u.avatar, u.address as technician_address
         FROM technicians t
         JOIN users u ON t.user_id = u.id
         WHERE t.user_id = ?`,
        [req.user.id],
      );

      if (!tech) {
        return res.status(404).json({ error: "Technician profile not found" });
      }

      // 1. Active Jobs (currently assigned/accepted/in progress for this technician)
      const activeJobs = await query.all(
        `SELECT sr.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
         FROM service_requests sr
         JOIN users u ON sr.customer_id = u.id
         WHERE sr.technician_id = ?
           AND sr.status IN ('ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS')
         ORDER BY sr.created_at DESC`,
        [tech.id],
      );

      // 2. New Requests (ONLY when technician is ONLINE and APPROVED)
      // When offline or not approved, technician receives zero new job requests
      let newRequests = [];
      const isApproved = tech.status === "Approved" || !tech.status;
      if (tech.is_online === 1 && isApproved) {
        newRequests = await query.all(
          `SELECT sr.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
           FROM service_requests sr
           JOIN users u ON sr.customer_id = u.id
           WHERE (
             sr.technician_id = ? 
             OR (
               sr.technician_id IS NULL 
               AND (sr.category = ? OR ? = 'General' OR ? = 'Plumbing')
             )
           )
           AND sr.status IN ('REQUESTED', 'ASSIGNED')
           AND sr.id NOT IN (
             SELECT request_id FROM status_logs 
             WHERE note LIKE '%Declined by ' || ? || '%'
           )
           ORDER BY sr.created_at DESC
           LIMIT 10`,
          [tech.id, tech.category, tech.category, tech.category, tech.name],
        );
      }

      // 3. Upcoming Jobs (Accepted bookings or scheduled for today/upcoming)
      const upcomingJobs = await query.all(
        `SELECT sr.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
         FROM service_requests sr
         JOIN users u ON sr.customer_id = u.id
         WHERE sr.technician_id = ?
           AND sr.status = 'ACCEPTED'
         ORDER BY sr.created_at DESC`,
        [tech.id],
      );

      // 4. Completed Jobs
      // 4. Completed Jobs
      const completedJobs = await query.all(
        `SELECT sr.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
         FROM service_requests sr
         JOIN users u ON sr.customer_id = u.id
         WHERE sr.technician_id = ?
           AND sr.status = 'COMPLETED'
         ORDER BY sr.updated_at DESC`,
        [tech.id],
      );

      // 4b. Cancelled & Declined Jobs History
      const cancelledJobs = await query.all(
        `SELECT sr.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
         FROM service_requests sr
         JOIN users u ON sr.customer_id = u.id
         WHERE (sr.technician_id = ? AND sr.status = 'CANCELLED')
            OR sr.id IN (
              SELECT request_id FROM status_logs 
              WHERE note LIKE '%Declined by ' || ? || '%'
            )
         ORDER BY sr.updated_at DESC`,
        [tech.id, tech.name],
      );

      // 5. Real Calculated Earnings (based on actual completed jobs)
      let totalEarningsNum = 0;
      let todayEarningsNum = 0;
      let weekEarningsNum = 0;
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      completedJobs.forEach((job) => {
        const amt = parseAmount(job.total_paid || job.price || 0);
        totalEarningsNum += amt;
        if (job.updated_at && job.updated_at.startsWith(todayStr)) {
          todayEarningsNum += amt;
        }
        if (job.updated_at && new Date(job.updated_at) >= sevenDaysAgo) {
          weekEarningsNum += amt;
        }
      });

      // Payouts history & total paid out
      const payouts = await query.all(
        `SELECT * FROM technician_payouts WHERE technician_id = ? ORDER BY created_at DESC`,
        [tech.id],
      );

      let totalPaidOut = 0;
      payouts.forEach((p) => {
        if (p.status === "Completed" || p.status === "Processing") {
          totalPaidOut += Number(p.amount) || 0;
        }
      });

      const availableBalanceNum = Math.max(0, totalEarningsNum - totalPaidOut);

      // Pending payments from active/in-progress jobs
      let pendingPaymentsNum = 0;
      activeJobs.forEach((job) => {
        pendingPaymentsNum += parseAmount(job.total_paid || job.price || 0);
      });

      // 6. Real Customer Reviews on Completed Jobs
      const reviews = completedJobs
        .filter((job) => job.rating && job.rating > 0)
        .map((job) => ({
          id: job.id,
          rating: job.rating,
          feedback: job.feedback || null,
          customerName: job.customer_name || null,
          date: job.updated_at || job.created_at,
          serviceName: job.service_name || job.category,
        }));

      // 7. Recent Transactions (Service Earnings Credits & Payout Debits)
      const serviceCredits = completedJobs.map((job) => ({
        id: `TXN-${job.id}`,
        type: "Credit",
        title: `Service Earnings: ${job.service_name || job.category}`,
        service: job.service_name || job.category,
        orderId: `#${job.id}`,
        customerName: job.customer_name || null,
        amount: parseAmount(job.total_paid || job.price || 0),
        amountFormatted: `+₹${parseAmount(job.total_paid || job.price || 0).toLocaleString("en-IN")}`,
        date: job.updated_at || job.created_at,
        status: "Settled",
      }));

      const payoutDebits = payouts.map((p) => ({
        id: `PAY-${p.id.slice(0, 8)}`,
        type: "Debit",
        title: `Bank Account Payout (${p.bank_account_tail ? `•••${p.bank_account_tail}` : "Direct Transfer"})`,
        service: "Payout Withdrawal",
        orderId: p.reference_id || `REF-${p.id.slice(0, 8)}`,
        customerName: "Argent Your Payouts Desk",
        amount: Number(p.amount) || 0,
        amountFormatted: `-₹${(Number(p.amount) || 0).toLocaleString("en-IN")}`,
        date: p.created_at,
        status: p.status,
      }));

      const recentTransactions = [...serviceCredits, ...payoutDebits].sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
      );

      // Bank account profile
      const bankAccount = {
        holderName: tech.bank_holder_name || "",
        bankName: tech.bank_name || "",
        accountNumberMasked: tech.bank_account_number
          ? `•••• •••• ${tech.bank_account_number.slice(-4)}`
          : "",
        ifsc: tech.bank_ifsc || "",
        verificationStatus: tech.bank_verification_status || "Not Connected",
        payoutStatus: tech.payout_status || "Active",
        isConnected: Boolean(tech.bank_account_number && tech.bank_ifsc),
      };

      // Real Event Notifications for Technician User
      const notifications = await query.all(
        `SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30`,
        [req.user.id],
      );

      res.json({
        technician: {
          ...tech,
          status: tech.status || "Pending Verification",
          account_type: tech.account_type || "individual",
          company_name: tech.company_name || null,
          authorized_person: tech.authorized_person || null,
          service_areas: tech.service_areas || "",
        },
        status: tech.status || "Pending Verification",
        availability: tech.is_online === 1 ? "ONLINE" : "OFFLINE",
        activeJobs,
        newRequests,
        upcomingJobs,
        completedJobs,
        cancelledJobs,
        metrics: {
          totalJobs: completedJobs.length,
          completedCount: completedJobs.length,
          activeCount: activeJobs.length,
          pendingCount: newRequests.length,
          rating: tech.rating == null ? null : Number(tech.rating).toFixed(1),
          totalEarnings: totalEarningsNum,
          todayEarnings: todayEarningsNum,
          weekEarnings: weekEarningsNum,
          availableBalance: availableBalanceNum,
          pendingBalance: pendingPaymentsNum,
          pendingPayments: pendingPaymentsNum,
          earningsFormatted: `₹${totalEarningsNum.toLocaleString("en-IN")}`,
          todayEarningsFormatted: `₹${todayEarningsNum.toLocaleString("en-IN")}`,
          weekEarningsFormatted: `₹${weekEarningsNum.toLocaleString("en-IN")}`,
          availableBalanceFormatted: `₹${availableBalanceNum.toLocaleString("en-IN")}`,
          pendingBalanceFormatted: `₹${pendingPaymentsNum.toLocaleString("en-IN")}`,
          pendingPaymentsFormatted: `₹${pendingPaymentsNum.toLocaleString("en-IN")}`,
        },
        bankAccount,
        payoutHistory: payouts,
        recentTransactions,
        reviews,
        notifications,
      });
    } catch (err) {
      console.error("Dashboard summary error:", err);
      res.status(500).json({ error: "Failed to load technician dashboard" });
    }
  });

  // Mark all technician notifications as read
  router.put("/notifications/read-all", authenticateToken, async (req, res) => {
    try {
      await query.run(
        `UPDATE user_notifications SET unread = 0 WHERE user_id = ?`,
        [req.user.id],
      );
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // Mark a single notification as read
  router.put("/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      await query.run(
        `UPDATE user_notifications SET unread = 0 WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user.id],
      );
      res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Edit / Update Technician Profile
  router.put("/profile", authenticateToken, async (req, res) => {
    try {
      const {
        name,
        phone,
        avatar,
        category,
        skills,
        experience_years,
        vehicle_type,
        address,
      } = req.body;

      const tech = await query.get(
        "SELECT id, user_id FROM technicians WHERE user_id = ?",
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      // Update users table
      await query.run(
        `UPDATE users
         SET name = COALESCE(?, name),
             phone = COALESCE(?, phone),
             avatar = COALESCE(?, avatar),
             address = COALESCE(?, address)
         WHERE id = ?`,
        [
          name ? name.trim() : null,
          phone || null,
          avatar || null,
          address || null,
          req.user.id,
        ],
      );

      // Update technicians table
      await query.run(
        `UPDATE technicians 
         SET category = COALESCE(?, category),
             skills = COALESCE(?, skills),
             experience_years = COALESCE(?, experience_years),
             vehicle_type = COALESCE(?, vehicle_type),
             service_areas = COALESCE(?, service_areas)
         WHERE id = ?`,
        [
          category || null,
          skills || null,
          experience_years !== undefined ? Number(experience_years) : null,
          vehicle_type || null,
          req.body.service_areas || null,
          tech.id,
        ],
      );

      // Fetch fresh updated user + tech record
      const updatedUser = await query.get(
        `SELECT u.id, u.name, u.email, u.role, u.phone, u.address, u.avatar,
                t.id as tech_id, t.category, t.status, t.rating, t.total_jobs,
                t.is_online, t.skills, t.experience_years, t.vehicle_type, t.service_areas
         FROM users u
         JOIN technicians t ON t.user_id = u.id
         WHERE u.id = ?`,
        [req.user.id],
      );

      res.json({
        success: true,
        message: "Professional profile updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
          avatar: updatedUser.avatar,
          technician: {
            id: updatedUser.tech_id,
            category: updatedUser.category,
            status: updatedUser.status,
            rating: updatedUser.rating,
            total_jobs: updatedUser.total_jobs,
            is_online: updatedUser.is_online,
            skills: updatedUser.skills,
            experience_years: updatedUser.experience_years,
            vehicle_type: updatedUser.vehicle_type,
            service_areas: updatedUser.service_areas || "Delhi NCR",
          },
        },
      });

      notifyTechnician(
        req.user.id,
        "Profile Updated",
        "Your professional profile details and avatar were successfully updated.",
        "system"
      );
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ error: "Failed to update professional profile" });
    }
  });

  // Connect / Update Bank Account for Payouts
  router.post("/bank-account", authenticateToken, async (req, res) => {
    try {
      const { holder_name, bank_name, account_number, ifsc } = req.body;
      if (!holder_name || !bank_name || !account_number || !ifsc) {
        return res.status(400).json({
          error:
            "Account Holder Name, Bank Name, Account Number, and IFSC are required",
        });
      }

      const tech = await query.get(
        "SELECT id, user_id FROM technicians WHERE user_id = ?",
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      const cleanedAcc = account_number.replace(/\s+/g, "");
      const cleanedIfsc = ifsc.trim().toUpperCase();

      if (cleanedAcc.length < 8) {
        return res
          .status(400)
          .json({ error: "Bank account number must be at least 8 digits" });
      }
      if (cleanedIfsc.length < 10) {
        return res.status(400).json({ error: "Invalid IFSC Code format" });
      }

      await query.run(
        `UPDATE technicians 
         SET bank_holder_name = ?,
             bank_name = ?,
             bank_account_number = ?,
             bank_ifsc = ?,
             bank_verification_status = 'Verified',
             payout_status = 'Active'
         WHERE id = ?`,
        [
          holder_name.trim(),
          bank_name.trim(),
          cleanedAcc,
          cleanedIfsc,
          tech.id,
        ],
      );

      res.json({
        success: true,
        message: "Bank account connected and verified for payouts.",
        bankAccount: {
          holderName: holder_name.trim(),
          bankName: bank_name.trim(),
          accountNumberMasked: `•••• •••• ${cleanedAcc.slice(-4)}`,
          ifsc: cleanedIfsc,
          verificationStatus: "Verified",
          payoutStatus: "Active",
          isConnected: true,
        },
      });
    } catch (err) {
      console.error("Connect bank account error:", err);
      res.status(500).json({ error: "Failed to connect bank account" });
    }
  });

  // Request Payout Withdrawal
  router.post("/payouts/request", authenticateToken, async (req, res) => {
    try {
      const { amount } = req.body;
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res
          .status(400)
          .json({ error: "Please enter a valid payout amount" });
      }

      const tech = await query.get(
        "SELECT * FROM technicians WHERE user_id = ?",
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      if (
        !tech.bank_account_number ||
        tech.bank_verification_status !== "Verified"
      ) {
        return res.status(400).json({
          error:
            "Please connect and verify your bank account before requesting payouts.",
        });
      }

      // Calculate available balance
      const completedJobs = await query.all(
        "SELECT total_paid, price FROM service_requests WHERE technician_id = ? AND status = 'COMPLETED'",
        [tech.id],
      );
      let totalEarned = 0;
      completedJobs.forEach((j) => {
        totalEarned += parseAmount(j.total_paid || j.price || 0);
      });

      const payouts = await query.all(
        "SELECT amount, status FROM technician_payouts WHERE technician_id = ?",
        [tech.id],
      );
      let totalPaidOut = 0;
      payouts.forEach((p) => {
        if (p.status === "Completed" || p.status === "Processing") {
          totalPaidOut += Number(p.amount) || 0;
        }
      });

      const availableBalance = Math.max(0, totalEarned - totalPaidOut);
      if (numAmount > availableBalance) {
        return res.status(400).json({
          error: `Requested amount (₹${numAmount}) exceeds available balance (₹${availableBalance.toLocaleString("en-IN")})`,
        });
      }

      const payoutId = uuidv4();
      const refId = `AY-PAY-${Date.now().toString().slice(-8)}`;
      const bankTail = (tech.bank_account_number || "").slice(-4);

      await query.run(
        `INSERT INTO technician_payouts (id, technician_id, amount, currency, status, bank_account_tail, reference_id)
         VALUES (?, ?, ?, 'INR', 'Completed', ?, ?)`,
        [payoutId, tech.id, numAmount, bankTail, refId],
      );

      notifyTechnician(
        req.user.id,
        "Payout Processed",
        `Payout of ₹${numAmount.toLocaleString("en-IN")} was processed successfully to account ending in •••${bankTail}. Ref: ${refId}`,
        "payout"
      );

      res.json({
        success: true,
        message: `Payout of ₹${numAmount.toLocaleString("en-IN")} processed successfully to account ending in •••${bankTail}.`,
        payout: {
          id: payoutId,
          amount: numAmount,
          status: "Completed",
          referenceId: refId,
          bankTail,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Request payout error:", err);
      res.status(500).json({ error: "Failed to process payout request" });
    }
  });

  // Toggle availability (online/offline)
  router.put("/availability", authenticateToken, async (req, res) => {
    try {
      const { is_online } = req.body;
      const tech = await query.get(
        "SELECT id, status FROM technicians WHERE user_id = ?",
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      if (is_online && tech.status && tech.status !== "Approved") {
        return res.status(403).json({
          error: `Cannot go ONLINE. Your account status is '${tech.status}'. Only Approved technicians can go online and receive customer jobs.`,
          status: tech.status,
        });
      }

      if (!is_online) {
        const activeJob = await query.get(
          `SELECT id, status FROM service_requests 
           WHERE technician_id = ? 
           AND status IN ('ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'ASSIGNED')`,
          [tech.id],
        );
        if (activeJob) {
          return res.status(400).json({
            error:
              "Cannot go OFFLINE while an active job is assigned. Please complete the job first.",
          });
        }
      }

      const newOnlineStatus = is_online ? 1 : 0;
      await query.run("UPDATE technicians SET is_online = ? WHERE id = ?", [
        newOnlineStatus,
        tech.id,
      ]);

      // Broadcast update to Admin Control Room
      io.to("role_admin").emit("technician_status_changed", {
        techId: tech.id,
        is_online: newOnlineStatus,
      });

      res.json({
        success: true,
        is_online: newOnlineStatus,
        status: newOnlineStatus === 1 ? "ONLINE" : "OFFLINE",
      });
    } catch (err) {
      console.error("Error updating availability:", err);
      res.status(500).json({ error: "Failed to update availability" });
    }
  });

  // Update verification status (Pending Verification, Approved, Rejected, Suspended)
  router.put(
    "/:id/verification-status",
    authenticateToken,
    async (req, res) => {
      try {
        const { status, verification_notes } = req.body;
        const validStatuses = [
          "Pending Verification",
          "Approved",
          "Rejected",
          "Suspended",
        ];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          });
        }

        await query.run(
          `UPDATE technicians 
           SET status = ?, 
               verification_notes = COALESCE(?, verification_notes),
               is_online = CASE WHEN ? != 'Approved' THEN 0 ELSE is_online END
           WHERE id = ?`,
          [status, verification_notes || null, status, req.params.id],
        );

        res.json({
          success: true,
          status,
          message: `Technician status updated to ${status}`,
        });
      } catch (err) {
        console.error("Verification status update error:", err);
        res.status(500).json({ error: "Failed to update verification status" });
      }
    },
  );

  // Accept a Job Request
  router.post("/jobs/:id/accept", authenticateToken, async (req, res) => {
    try {
      const tech = await query.get(
        `SELECT t.*, u.name, u.phone FROM technicians t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?`,
        [req.user.id],
      );
      if (!tech)
        return res.status(404).json({ error: "Technician profile not found" });

      if (tech.status && tech.status !== "Approved") {
        return res.status(403).json({
          error: `Cannot accept jobs. Your technician status is '${tech.status}'. Only Approved technicians can accept customer jobs.`,
        });
      }

      if (tech.is_online !== 1) {
        return res.status(400).json({
          error:
            "You are currently OFFLINE. Please switch to ONLINE to accept job requests.",
        });
      }

      const request = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      if (!request)
        return res.status(404).json({ error: "Job request not found" });

      if (request.status === "COMPLETED" || request.status === "CANCELLED") {
        return res
          .status(400)
          .json({ error: `Job is already ${request.status.toLowerCase()}` });
      }

      // Update request status to ACCEPTED and assign to this technician
      await query.run(
        `UPDATE service_requests 
         SET status = 'ACCEPTED', technician_id = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [tech.id, req.params.id],
      );

      // Update technician status
      await query.run(
        `UPDATE technicians SET is_busy = 1, current_request_id = ? WHERE id = ?`,
        [req.params.id, tech.id],
      );

      // Log status transition
      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, ?, 'ACCEPTED', ?)`,
        [
          uuidv4(),
          req.params.id,
          request.status,
          `Accepted by certified technician ${tech.name}`,
        ],
      );

      // Send real customer notification
      try {
        await query.run(
          `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
           VALUES (?, ?, ?, ?, 'dispatch', 1)`,
          [
            uuidv4(),
            request.customer_id,
            `Technician Confirmed: ${tech.name}`,
            `${tech.name} (${tech.phone || "+91 98101 11223"}) has accepted your booking #${req.params.id}.`,
          ],
        );
      } catch (notifErr) {
        console.warn("Notification insert error on accept:", notifErr);
      }

      notifyTechnician(
        req.user.id,
        "Job Accepted",
        `You accepted booking #${req.params.id} for ${request.service_name || request.category}. Address: ${request.address || "Customer Location"}.`,
        "dispatch"
      );

      // Realtime websocket notifications
      io.to(`request_${req.params.id}`).emit("request_updated", {
        id: req.params.id,
        status: "ACCEPTED",
        technician: {
          id: tech.id,
          name: tech.name,
          phone: tech.phone,
        },
      });
      io.to("role_admin").emit("job_accepted", {
        requestId: req.params.id,
        technicianId: tech.id,
        technicianName: tech.name,
      });

      const updatedJob = await query.get(
        `SELECT sr.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
         FROM service_requests sr
         JOIN users u ON sr.customer_id = u.id
         WHERE sr.id = ?`,
        [req.params.id],
      );

      res.json({
        success: true,
        message: "Job accepted successfully",
        job: updatedJob,
      });
    } catch (err) {
      console.error("Accept job error:", err);
      res.status(500).json({ error: "Failed to accept job" });
    }
  });

  // Reject / Decline a Job Request
  router.post("/jobs/:id/reject", authenticateToken, async (req, res) => {
    try {
      const { reason } = req.body;
      const tech = await query.get(
        `SELECT t.*, u.name FROM technicians t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?`,
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      const request = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      if (!request)
        return res.status(404).json({ error: "Job request not found" });

      // Unassign technician if this technician was assigned
      if (request.technician_id === tech.id) {
        await query.run(
          `UPDATE service_requests SET technician_id = NULL, status = 'REQUESTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [req.params.id],
        );
        await query.run(
          `UPDATE technicians SET is_busy = 0, current_request_id = NULL WHERE id = ?`,
          [tech.id],
        );
      }

      // Record decline in status_logs
      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.params.id,
          request.status,
          request.status,
          `Declined by ${tech.name}: ${reason || "Technician unavailable"}`,
        ],
      );

      notifyTechnician(
        req.user.id,
        "Job Request Declined",
        `You declined booking #${req.params.id}. ${reason ? `Reason: ${reason}` : ""}`,
        "system"
      );

      res.json({
        success: true,
        message: "Job request declined",
      });
    } catch (err) {
      console.error("Reject job error:", err);
      res.status(500).json({ error: "Failed to decline job request" });
    }
  });

  // Update Job Status (Sequential Workflow: ACCEPTED -> ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED)
  router.post("/jobs/:id/status", authenticateToken, async (req, res) => {
    try {
      const { newStatus } = req.body;
      const validStatuses = [
        "ACCEPTED",
        "ON_THE_WAY",
        "ARRIVED",
        "IN_PROGRESS",
        "COMPLETED",
      ];

      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const tech = await query.get(
        `SELECT t.*, u.name, u.phone FROM technicians t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?`,
        [req.user.id],
      );
      if (!tech)
        return res.status(404).json({ error: "Technician profile not found" });

      const request = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      // Sequential Workflow & Location Verification
      if (newStatus === "ON_THE_WAY") {
        if (!["ACCEPTED", "ASSIGNED"].includes(request.status)) {
          return res.status(400).json({
            error: "Cannot start trip. Job must be in ACCEPTED status first.",
          });
        }
      } else if (newStatus === "ARRIVED") {
        if (request.status !== "ON_THE_WAY") {
          return res.status(400).json({
            error:
              "Cannot mark arrived before starting trip (ON_THE_WAY status required).",
          });
        }

        const techLat = parseFloat(req.body.lat);
        const techLng = parseFloat(req.body.lng);

        if (isNaN(techLat) || isNaN(techLng)) {
          return res.status(400).json({
            error:
              "Location access and verified GPS coordinates are required to confirm arrival at customer doorstep.",
          });
        }

        const customerLat = parseFloat(request.latitude);
        const customerLng = parseFloat(request.longitude);

        if (!isNaN(customerLat) && !isNaN(customerLng)) {
          const distKm = calculateDistance(
            techLat,
            techLng,
            customerLat,
            customerLng,
          );
          const distMeters = Math.round(distKm * 1000);
          const MAX_ARRIVAL_RADIUS_METERS = 100;

          if (distMeters > MAX_ARRIVAL_RADIUS_METERS) {
            return res.status(400).json({
              error: `Location validation failed: You are ${distMeters}m away from customer doorstep. Arrival requires being within ${MAX_ARRIVAL_RADIUS_METERS} meters.`,
              distanceMeters: distMeters,
              maxRadiusMeters: MAX_ARRIVAL_RADIUS_METERS,
            });
          }
        }

        // Update technician's verified coordinates
        await query.run(
          "UPDATE technicians SET latitude = ?, longitude = ? WHERE id = ?",
          [techLat, techLng, tech.id],
        );
      } else if (newStatus === "IN_PROGRESS") {
        if (request.status !== "ARRIVED") {
          return res.status(400).json({
            error:
              "Cannot start service before arriving at customer doorstep (ARRIVED status required).",
          });
        }
      } else if (newStatus === "COMPLETED") {
        if (request.status !== "IN_PROGRESS") {
          return res.status(400).json({
            error:
              "Cannot complete job before service has started (IN_PROGRESS status required).",
          });
        }
      }

      // Update request status
      if (newStatus === "COMPLETED") {
        await query.run(
          `UPDATE service_requests SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [req.params.id],
        );
      } else {
        await query.run(
          `UPDATE service_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [newStatus, req.params.id],
        );
      }

      // Handle completion
      if (newStatus === "COMPLETED") {
        await query.run(
          `UPDATE technicians 
           SET is_busy = 0, total_jobs = total_jobs + 1, current_request_id = NULL 
           WHERE id = ?`,
          [tech.id],
        );
      } else {
        await query.run(
          `UPDATE technicians SET is_busy = 1, current_request_id = ? WHERE id = ?`,
          [req.params.id, tech.id],
        );
      }

      // Human-readable labels and notification texts
      const statusMeta = {
        ON_THE_WAY: {
          note: `${tech.name} is on the way to the customer address`,
          title: "Technician On the Way",
          desc: `${tech.name} has departed and is en route to your service location.`,
          type: "tracking",
        },
        ARRIVED: {
          note: `${tech.name} has arrived at customer premises`,
          title: "Technician Arrived",
          desc: `${tech.name} has reached your doorstep. Please grant entry.`,
          type: "dispatch",
        },
        IN_PROGRESS: {
          note: `Service work started by ${tech.name}`,
          title: "Service In Progress",
          desc: `Work has commenced for your booking #${req.params.id}.`,
          type: "service",
        },
        COMPLETED: {
          note: `Service completed successfully by ${tech.name}`,
          title: "Service Completed",
          desc: `Your service booking #${req.params.id} is complete! Tap here to rate your professional.`,
          type: "completed",
        },
      };

      const meta = statusMeta[newStatus];

      // Add status log
      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.params.id,
          request.status,
          newStatus,
          meta ? meta.note : `Status updated to ${newStatus}`,
        ],
      );

      // Send real customer notification
      if (meta) {
        try {
          await query.run(
            `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [uuidv4(), request.customer_id, meta.title, meta.desc, meta.type],
          );
        } catch (notifErr) {
          console.warn("Notification insert error on status update:", notifErr);
        }
      }

      // Send real technician notification
      const techNotifMeta = {
        ON_THE_WAY: {
          title: "Trip Started",
          desc: `You started the trip to customer premises (${request.address || "Service Location"}).`,
          type: "tracking",
        },
        ARRIVED: {
          title: "Arrived at Doorstep",
          desc: `GPS verified arrival confirmed for booking #${req.params.id}.`,
          type: "dispatch",
        },
        IN_PROGRESS: {
          title: "Service In Progress",
          desc: `Service commenced for booking #${req.params.id}.`,
          type: "service",
        },
        COMPLETED: {
          title: "Service Completed",
          desc: `Booking #${req.params.id} completed. Earnings of ₹${parseAmount(request.total_paid || request.price || 0).toLocaleString("en-IN")} credited.`,
          type: "completed",
        },
      };

      if (techNotifMeta[newStatus]) {
        notifyTechnician(
          req.user.id,
          techNotifMeta[newStatus].title,
          techNotifMeta[newStatus].desc,
          techNotifMeta[newStatus].type,
        );
      }

      // Emit realtime socket event
      io.to(`request_${req.params.id}`).emit("request_updated", {
        id: req.params.id,
        status: newStatus,
      });
      io.to("role_admin").emit("request_updated", {
        id: req.params.id,
        status: newStatus,
        technicianId: tech.id,
      });

      const updatedJob = await query.get(
        `SELECT sr.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
         FROM service_requests sr
         JOIN users u ON sr.customer_id = u.id
         WHERE sr.id = ?`,
        [req.params.id],
      );

      res.json({
        success: true,
        message: `Job status transitioned to ${newStatus}`,
        job: updatedJob,
      });
    } catch (err) {
      console.error("Update job status error:", err);
      res.status(500).json({ error: "Failed to update job status" });
    }
  });

  // Complete Job Endpoint (Direct helper)
  router.post("/jobs/:id/complete", authenticateToken, async (req, res) => {
    try {
      const tech = await query.get(
        `SELECT t.*, u.name FROM technicians t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?`,
        [req.user.id],
      );
      if (!tech) return res.status(404).json({ error: "Technician not found" });

      const request = await query.get(
        "SELECT * FROM service_requests WHERE id = ?",
        [req.params.id],
      );
      if (!request)
        return res.status(404).json({ error: "Job request not found" });

      if (request.status !== "IN_PROGRESS") {
        return res.status(400).json({
          error:
            "Cannot complete job before service has started (IN_PROGRESS status required).",
        });
      }

      await query.run(
        `UPDATE service_requests SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [req.params.id],
      );

      await query.run(
        `UPDATE technicians 
         SET is_busy = 0, total_jobs = total_jobs + 1, current_request_id = NULL 
         WHERE id = ?`,
        [tech.id],
      );

      await query.run(
        `INSERT INTO status_logs (id, request_id, old_status, new_status, note)
         VALUES (?, ?, ?, 'COMPLETED', ?)`,
        [
          uuidv4(),
          req.params.id,
          request.status,
          `Service completed by ${tech.name}`,
        ],
      );

      try {
        await query.run(
          `INSERT INTO user_notifications (id, user_id, title, description, type, unread)
           VALUES (?, ?, ?, ?, 'completed', 1)`,
          [
            uuidv4(),
            request.customer_id,
            `Service Completed: #${req.params.id}`,
            `Your service has been successfully completed. Tap to rate your professional.`,
          ],
        );
      } catch (notifErr) {
        console.warn("Notification insert error on complete:", notifErr);
      }

      notifyTechnician(
        req.user.id,
        "Service Completed",
        `Job #${req.params.id} marked complete. ₹${parseAmount(request.total_paid || request.price || 0).toLocaleString("en-IN")} credited to your balance.`,
        "completed"
      );

      io.to(`request_${req.params.id}`).emit("request_updated", {
        id: req.params.id,
        status: "COMPLETED",
      });

      res.json({
        success: true,
        message: "Job completed successfully",
      });
    } catch (err) {
      console.error("Complete job error:", err);
      res.status(500).json({ error: "Failed to mark job as complete" });
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
