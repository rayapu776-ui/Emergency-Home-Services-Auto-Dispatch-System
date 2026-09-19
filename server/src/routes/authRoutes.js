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

// Step 1: Verify Credentials (Email or Phone + Password) and Issue OTP
router.post("/login-step1", async (req, res) => {
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

    const sessionInfo = await otpService.createOtpSession(
      user,
      inputIdentifier,
    );

    if (!sessionInfo.success) {
      return res.status(503).json({
        error: sessionInfo.error || "Unable to send authentication code. Please try again.",
        details: sessionInfo.reason,
      });
    }

    return res.json({
      status: "OTP_REQUIRED",
      ...sessionInfo,
      message: "Verification code sent successfully",
    });
  } catch (err) {
    console.error("Login step 1 error:", err);
    res.status(500).json({ error: "Failed to process login request" });
  }
});

// Step 2: Verify 6-digit OTP and Issue JWT Auth Token
router.post("/verify-otp", async (req, res) => {
  try {
    const { tempSessionToken, otp } = req.body;
    if (!tempSessionToken || !otp) {
      return res
        .status(400)
        .json({
          error: "Session token and 6-digit verification code are required",
        });
    }

    const result = await otpService.verifyOtp(tempSessionToken, otp);
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        remainingAttempts: result.remainingAttempts,
      });
    }

    const user = result.user;
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

    return res.json({
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
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

// Resend OTP code with rate limit enforcement
router.post("/resend-otp", async (req, res) => {
  try {
    const { tempSessionToken } = req.body;
    if (!tempSessionToken) {
      return res.status(400).json({ error: "Session token is required" });
    }

    const result = await otpService.resendOtp(tempSessionToken);
    if (!result.success) {
      const statusCode = result.cooldownRemaining ? 400 : 503;
      return res.status(statusCode).json({
        error: result.error || "Unable to send authentication code. Please try again.",
        cooldownRemaining: result.cooldownRemaining,
        details: result.reason,
      });
    }

    return res.json({
      ...result,
      message: "A fresh verification code has been dispatched",
    });
  } catch (err) {
    console.error("OTP resend error:", err);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});

// Traditional or fallback login endpoint
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, phone, password, otp, tempSessionToken } =
      req.body;

    // If OTP is provided, verify Step 2
    if (otp && tempSessionToken) {
      const result = await otpService.verifyOtp(tempSessionToken, otp);
      if (!result.success) {
        return res.status(400).json({
          error: result.error,
          remainingAttempts: result.remainingAttempts,
        });
      }

      const user = result.user;
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

      return res.json({
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
    }

    // Step 1 check
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

    const sessionInfo = await otpService.createOtpSession(
      user,
      inputIdentifier,
    );

    if (!sessionInfo.success) {
      return res.status(503).json({
        error: sessionInfo.error || "Unable to send authentication code. Please try again.",
        details: sessionInfo.reason,
      });
    }

    return res.json({
      status: "OTP_REQUIRED",
      ...sessionInfo,
      message: "Verification code sent successfully",
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
