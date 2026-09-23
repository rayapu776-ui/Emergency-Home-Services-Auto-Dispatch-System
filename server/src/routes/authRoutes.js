import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";
import otpService from "../services/otpService.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "customer",
      phone,
      address,
      category,
      vehicle_type,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const existing = await query.get("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    if (!["customer", "technician"].includes(role)) {
      return res.status(403).json({
        error: "Only customer or technician accounts can self-register",
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const lat = Number((28.6315 + (Math.random() - 0.5) * 0.04).toFixed(6));
    const lon = Number((77.2167 + (Math.random() - 0.5) * 0.04).toFixed(6));

    await query.run(
      `INSERT INTO users (id, name, email, password_hash, role, phone, address, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        email,
        passwordHash,
        role,
        phone || null,
        address || "Delhi NCR",
        lat,
        lon,
      ],
    );

    let technicianData = null;
    if (role === "technician") {
      const techId = uuidv4();
      await query.run(
        `INSERT INTO technicians (id, user_id, category, latitude, longitude, is_online, is_busy, rating, total_jobs, vehicle_type)
         VALUES (?, ?, ?, ?, ?, 1, 0, 4.9, 0, ?)`,
        [
          techId,
          userId,
          category || "Plumbing",
          lat,
          lon,
          vehicle_type || "Van",
        ],
      );
      technicianData = {
        id: techId,
        category: category || "Plumbing",
        is_online: 1,
        is_busy: 0,
        rating: 4.9,
      };
    }

    const token = generateToken({ id: userId, email, role, name });
    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role,
        phone,
        address,
        latitude: lat,
        longitude: lon,
        technician: technicianData,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Dedicated Professional / Technician Registration (Individual & Company)
router.post("/register-technician", async (req, res) => {
  try {
    const {
      account_type = "individual", // 'individual' | 'company'
      name,
      company_name,
      authorized_person,
      email,
      phone,
      location,
      address,
      category,
      skills,
      experience_years,
      experience_description,
      avatar,
      id_document_type,
      id_document_url,
      business_registration_number,
      service_areas,
      password,
      confirmPassword,
    } = req.body;

    const displayName =
      account_type === "company"
        ? (company_name || name || "").trim()
        : (name || "").trim();

    if (!displayName || !email || !password) {
      return res.status(400).json({
        error:
          account_type === "company"
            ? "Company Name, Business Email, and Password are required."
            : "Full Name, Email, and Password are required.",
      });
    }

    if (account_type === "company" && !authorized_person?.trim()) {
      return res.status(400).json({
        error:
          "Owner / Authorized Person Name is required for company registration.",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await query.get(
      "SELECT id FROM users WHERE LOWER(email) = ?",
      [trimmedEmail],
    );
    if (existing) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists." });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    const techId = uuidv4();
    const lat = Number((28.6315 + (Math.random() - 0.5) * 0.04).toFixed(6));
    const lon = Number((77.2167 + (Math.random() - 0.5) * 0.04).toFixed(6));
    const defaultAvatar =
      avatar ||
      (account_type === "company"
        ? "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=300&q=80"
        : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80");

    const resolvedAddress = address || location || service_areas || "Delhi NCR";

    // 1. Insert into users with role = 'technician' (strictly NOT 'customer')
    await query.run(
      `INSERT INTO users (id, name, email, password_hash, role, phone, address, avatar, latitude, longitude)
       VALUES (?, ?, ?, ?, 'technician', ?, ?, ?, ?, ?)`,
      [
        userId,
        displayName,
        trimmedEmail,
        passwordHash,
        phone || null,
        resolvedAddress,
        defaultAvatar,
        lat,
        lon,
      ],
    );

    // 2. Insert into technicians with status = 'Pending Verification' and is_online = 0
    await query.run(
      `INSERT INTO technicians (
        id, user_id, category, latitude, longitude, is_online, is_busy, rating, total_jobs,
        vehicle_type, status, skills, experience_years, experience_description, id_document_type, id_document_url,
        account_type, company_name, authorized_person, business_registration_number, service_areas
      ) VALUES (?, ?, ?, ?, ?, 0, 0, 5.0, 0, 'Service Vehicle', 'Pending Verification', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        techId,
        userId,
        category || "Plumbing",
        lat,
        lon,
        skills || "",
        Number(experience_years) || 1,
        experience_description ||
          (account_type === "company"
            ? `Company operations managed by ${authorized_person}`
            : ""),
        id_document_type ||
          (account_type === "company"
            ? "GST / Business License"
            : "Government Photo ID"),
        id_document_url || "",
        account_type,
        account_type === "company" ? displayName : null,
        account_type === "company" ? authorized_person?.trim() : null,
        business_registration_number || null,
        service_areas || location || "Delhi NCR",
      ],
    );

    res.status(201).json({
      success: true,
      message:
        "Professional application submitted successfully. Your account is now Pending Verification.",
      application: {
        id: techId,
        userId,
        accountType: account_type,
        name: displayName,
        authorizedPerson: authorized_person || null,
        email: trimmedEmail,
        category: category || "Plumbing",
        status: "Pending Verification",
        location: resolvedAddress,
        serviceAreas: service_areas || location || "Delhi NCR",
      },
    });
  } catch (err) {
    console.error("Technician registration error:", err);
    res
      .status(500)
      .json({ error: "Failed to submit technician registration." });
  }
});

/**
 * Shared Send Code Handler
 * POST /api/auth/send-code
 * Body: { identifier, role = "customer", channel, password }
 */
const handleSendCode = async (req, res) => {
  try {
    const {
      identifier,
      email,
      phone,
      role: rawRole,
      channel: requestedChannel,
      password,
    } = req.body;
    const rawIdentifier = (identifier || email || phone || "").trim();

    if (!rawIdentifier) {
      return res.status(400).json({
        error: "Please enter your registered email address or mobile number.",
      });
    }

    const isEmail = rawIdentifier.includes("@");
    const channel = requestedChannel || (isEmail ? "email" : "sms");
    const normalizedIdentifier = isEmail
      ? rawIdentifier.toLowerCase()
      : rawIdentifier;

    const role =
      rawRole === "professional" || rawRole === "technician"
        ? "technician"
        : "customer";

    // Look up existing user
    let user = await otpService.findUserByIdentifier(normalizedIdentifier);

    // If user exists, enforce role separation
    if (user) {
      if (
        role === "technician" &&
        user.role !== "technician" &&
        user.role !== "admin"
      ) {
        return res.status(403).json({
          error:
            "This account is registered as a customer. Please use customer sign-in or register as a professional.",
        });
      }
      if (role === "customer" && user.role === "technician") {
        return res.status(403).json({
          error:
            "This account is registered as a service professional. Please use the Professional login portal.",
        });
      }

      // If password provided, verify it
      if (password) {
        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
          return res
            .status(401)
            .json({ error: "Invalid email/phone or password" });
        }
      }
    } else {
      // If user does not exist yet (OTP-based registration or passwordless entry)
      const newUserId = uuidv4();
      const userEmail = isEmail
        ? normalizedIdentifier
        : `user_${newUserId.slice(0, 8)}@temp.argentyour.com`;
      const userPhone = isEmail ? null : normalizedIdentifier;
      const userName =
        role === "technician" ? "New Professional Partner" : "Valued Customer";

      await query.run(
        `INSERT INTO users (id, name, email, password_hash, role, phone, address)
         VALUES (?, ?, ?, ?, ?, ?, 'Delhi NCR')`,
        [
          newUserId,
          userName,
          userEmail,
          bcrypt.hashSync(uuidv4(), 8),
          role,
          userPhone,
        ],
      );

      if (role === "technician") {
        const techId = uuidv4();
        await query.run(
          `INSERT INTO technicians (id, user_id, category, latitude, longitude, is_online, rating, total_jobs)
           VALUES (?, ?, 'Plumbing', 28.6139, 77.2090, 1, 4.9, 0)`,
          [techId, newUserId],
        );
      }

      user = await query.get("SELECT * FROM users WHERE id = ?", [newUserId]);
    }

    const otpResult = await otpService.createOtpSession(
      user,
      normalizedIdentifier,
    );

    if (!otpResult.success) {
      return res.status(otpResult.rateLimited ? 429 : 503).json({
        error:
          otpResult.error ||
          "Unable to send the verification code right now. Please try again.",
        retryAfterSeconds: otpResult.retryAfterSeconds,
      });
    }

    return res.json({
      success: true,
      status: "OTP_REQUIRED",
      message: "Verification code sent successfully",
      channel: otpResult.channel,
      maskedDestination: otpResult.maskedDestination,
      tempSessionToken: otpResult.tempSessionToken,
      cooldownSeconds: otpResult.cooldownSeconds || 60,
      expiresInSeconds: otpResult.expiresInSeconds || 300,
    });
  } catch (err) {
    console.error("❌ [Auth] Error in send-code:", err);
    return res.status(500).json({
      error:
        "Unable to send the verification code right now. Please try again.",
    });
  }
};

/**
 * Shared Verify Code Handler
 * POST /api/auth/verify-code
 * Body: { identifier, role, code, otp, tempSessionToken }
 */
const handleVerifyCode = async (req, res) => {
  try {
    const {
      tempSessionToken,
      identifier,
      email,
      phone,
      code,
      otp,
      role: rawRole,
    } = req.body;
    const sessionRef = tempSessionToken || identifier || email || phone;
    const inputCode = String(code || otp || "").trim();

    if (!sessionRef || !inputCode) {
      return res.status(400).json({
        error: "Verification code and session identifier are required.",
      });
    }

    if (inputCode.length !== 6 || !/^\d{6}$/.test(inputCode)) {
      return res.status(400).json({
        error: "Please enter the complete 6-digit numeric verification code.",
      });
    }

    const verifyResult = await otpService.verifyOtp(sessionRef, inputCode);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error:
          verifyResult.error || "Invalid verification code. Please try again.",
        remainingAttempts: verifyResult.remainingAttempts,
      });
    }

    const user = verifyResult.user;
    const role =
      rawRole === "professional" || rawRole === "technician"
        ? "technician"
        : rawRole || user.role;

    // Enforce role access control
    if (
      role === "technician" &&
      user.role !== "technician" &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error:
          "This account is registered as a customer. Please use customer sign-in or register as a professional.",
      });
    }
    if (role === "customer" && user.role === "technician") {
      return res.status(403).json({
        success: false,
        error:
          "This account is registered as a service professional. Please use the Professional login portal.",
      });
    }

    let technicianData = null;
    if (user.role === "technician") {
      technicianData = await query.get(
        "SELECT * FROM technicians WHERE user_id = ?",
        [user.id],
      );
      if (!technicianData) {
        const techId = uuidv4();
        await query.run(
          `INSERT INTO technicians (id, user_id, category, latitude, longitude, is_online, rating, total_jobs)
           VALUES (?, ?, 'Plumbing', 28.6139, 77.2090, 1, 4.9, 0)`,
          [techId, user.id],
        );
        technicianData = await query.get(
          "SELECT * FROM technicians WHERE id = ?",
          [techId],
        );
      }
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      success: true,
      message: "Verification successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        technician: technicianData,
      },
    });
  } catch (err) {
    console.error("❌ [Auth] Error in verify-code:", err);
    return res.status(500).json({
      error: "Unable to verify authentication code. Please try again.",
    });
  }
};

/**
 * Shared Resend Code Handler
 * POST /api/auth/resend-code
 * Body: { tempSessionToken, identifier }
 */
const handleResendCode = async (req, res) => {
  try {
    const { tempSessionToken, identifier, email, phone } = req.body;
    const sessionRef = tempSessionToken || identifier || email || phone;

    if (!sessionRef) {
      return res.status(400).json({
        error:
          "Session token or registered identifier is required to resend code.",
      });
    }

    const resendResult = await otpService.resendOtp(sessionRef);

    if (!resendResult.success) {
      const statusCode =
        resendResult.cooldownRemaining || resendResult.rateLimited ? 429 : 400;
      return res.status(statusCode).json({
        success: false,
        error:
          resendResult.error ||
          "Unable to send the verification code right now. Please try again.",
        cooldownRemaining: resendResult.cooldownRemaining,
        retryAfterSeconds: resendResult.retryAfterSeconds,
      });
    }

    return res.json({
      success: true,
      message: "A fresh verification code has been sent.",
      channel: resendResult.channel,
      maskedDestination: resendResult.maskedDestination,
      tempSessionToken: resendResult.tempSessionToken || tempSessionToken,
      cooldownSeconds: resendResult.cooldownSeconds || 60,
      expiresInSeconds: resendResult.expiresInSeconds || 300,
    });
  } catch (err) {
    console.error("❌ [Auth] Error in resend-code:", err);
    return res.status(500).json({
      error:
        "Unable to send the verification code right now. Please try again.",
    });
  }
};

// Route definitions for send-code, verify-code, and resend-code
router.post("/send-code", handleSendCode);
router.post("/send-otp", handleSendCode);
router.post("/login-step1", handleSendCode);

router.post("/verify-code", handleVerifyCode);
router.post("/verify-otp", handleVerifyCode);

router.post("/resend-code", handleResendCode);
router.post("/resend-otp", handleResendCode);

// Password Reset Endpoints
router.post("/forgot-password", async (req, res) => {
  try {
    const { identifier, email, phone } = req.body;
    const rawIdentifier = (identifier || email || phone || "").trim();
    if (!rawIdentifier) {
      return res
        .status(400)
        .json({ error: "Please enter your registered email or phone." });
    }

    const user = await otpService.findUserByIdentifier(rawIdentifier);
    if (!user) {
      return res.status(404).json({
        error: "No account found with this email or mobile number.",
      });
    }

    const otpResult = await otpService.createOtpSession(user, rawIdentifier);
    if (!otpResult.success) {
      return res.status(503).json({
        error:
          otpResult.error ||
          "Unable to send the verification code right now. Please try again.",
      });
    }

    return res.json({
      success: true,
      status: "OTP_REQUIRED",
      message: "Verification code sent to your registered contact.",
      tempSessionToken: otpResult.tempSessionToken,
      maskedDestination: otpResult.maskedDestination,
      cooldownSeconds: otpResult.cooldownSeconds || 60,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      error: "Unable to process password reset request. Please try again.",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const {
      identifier,
      tempSessionToken,
      code,
      otp,
      newPassword,
      new_password,
      password,
    } = req.body;
    const sessionRef = tempSessionToken || identifier;
    const inputCode = String(code || otp || "").trim();
    const effectiveNewPassword = newPassword || new_password || password;

    if (!sessionRef || !inputCode) {
      return res.status(400).json({
        error: "Verification code and session identifier are required.",
      });
    }

    if (!effectiveNewPassword || effectiveNewPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long.",
      });
    }

    const verifyResult = await otpService.verifyOtp(sessionRef, inputCode);
    if (!verifyResult.success) {
      return res.status(400).json({
        error:
          verifyResult.error || "Invalid verification code. Please try again.",
      });
    }

    const user = verifyResult.user;
    const newHash = bcrypt.hashSync(effectiveNewPassword, 10);
    await query.run("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      user.id,
    ]);

    return res.json({
      success: true,
      message:
        "Password updated successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res
      .status(500)
      .json({ error: "Failed to reset password. Please try again." });
  }
});

// Direct Login endpoint with Email or Phone + Password (No OTP)
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const inputIdentifier = (identifier || email || phone || "").trim();

    if (!inputIdentifier || !password) {
      return res
        .status(400)
        .json({ error: "Email or phone number and password are required" });
    }

    const user = await otpService.findUserByIdentifier(inputIdentifier);
    if (!user) {
      return res.status(401).json({ error: "Invalid email/phone or password" });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email/phone or password" });
    }

    // Role check: Prevent technician from logging in through Customer portal
    if (user.role === "technician") {
      return res.status(403).json({
        error:
          "This account is registered as a service professional. Please use the Professional login portal.",
      });
    }

    let technicianData = null;
    if (user.role === "technician" || user.role === "admin") {
      technicianData = await query.get(
        "SELECT * FROM technicians WHERE user_id = ?",
        [user.id],
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        latitude: user.latitude,
        longitude: user.longitude,
        technician: technicianData,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// Instant Demo Login (Zero credentials friction for testing)
router.post("/demo-login", async (req, res) => {
  try {
    const { role = "customer", category = "Plumbing" } = req.body;

    let targetEmail = "customer@demo.com";
    if (role === "admin") {
      targetEmail = "admin@demo.com";
    } else if (role === "technician") {
      const emailMap = {
        Plumbing: "tech.plumber@demo.com",
        Electrical: "tech.electric@demo.com",
        HVAC: "tech.hvac@demo.com",
        Appliance: "tech.appliance@demo.com",
        Locksmith: "tech.locksmith@demo.com",
        "Gas Leak": "tech.gas@demo.com",
      };
      targetEmail = emailMap[category] || "tech.plumber@demo.com";
    }

    const user = await query.get("SELECT * FROM users WHERE email = ?", [
      targetEmail,
    ]);
    if (!user) {
      return res.status(404).json({ error: "Demo account not found" });
    }

    let technicianData = null;
    if (user.role === "technician") {
      technicianData = await query.get(
        "SELECT * FROM technicians WHERE user_id = ?",
        [user.id],
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        technician: technicianData,
      },
    });
  } catch (err) {
    console.error("Demo login error:", err);
    res.status(500).json({ error: "Failed demo login" });
  }
});

// Get current logged-in user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await query.get(
      "SELECT id, name, email, role, phone, avatar, address, latitude, longitude, created_at FROM users WHERE id = ?",
      [req.user.id],
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    let technicianData = null;
    if (user.role === "technician") {
      technicianData = await query.get(
        "SELECT * FROM technicians WHERE user_id = ?",
        [user.id],
      );
    }

    res.json({
      user: {
        ...user,
        technician: technicianData,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// Update Profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, latitude, longitude } = req.body;
    await query.run(
      `UPDATE users 
       SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address),
           latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude)
       WHERE id = ?`,
      [name, phone, address, latitude, longitude, req.user.id],
    );

    const updated = await query.get(
      "SELECT id, name, email, role, phone, address, latitude, longitude FROM users WHERE id = ?",
      [req.user.id],
    );
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
