import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import otpService from "../services/otpService.js";
import { generateToken } from "../middleware/auth.js";

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getVerifiedChannel(identifier, requestedChannel) {
  const isEmail = identifier.includes("@");
  const channel = requestedChannel || (isEmail ? "email" : "sms");

  if (!["email", "sms"].includes(channel)) {
    return { error: "Please choose email or SMS verification." };
  }
  if (isEmail && (!EMAIL_PATTERN.test(identifier) || channel !== "email")) {
    return {
      error: "Please enter a valid email address for email verification.",
    };
  }

  const phoneDigits = identifier.replace(/\D/g, "");
  if (
    !isEmail &&
    (channel !== "sms" || phoneDigits.length < 10 || phoneDigits.length > 15)
  ) {
    return {
      error: "Please enter a valid mobile number for SMS verification.",
    };
  }

  return { channel, isEmail };
}

/**
 * POST /api/professional/auth/send-otp and /send-code
 * Generates secure 6-digit OTP and dispatches via configured Email / SMS provider
 */
const handleSendOtp = async (req, res) => {
  try {
    const { identifier, channel: requestedChannel, password } = req.body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return res.status(400).json({
        error: "Please enter your registered email address or mobile number.",
      });
    }

    const cleanIdentifier = identifier.trim();
    const channelInfo = getVerifiedChannel(cleanIdentifier, requestedChannel);
    if (channelInfo.error) {
      return res.status(400).json({ error: channelInfo.error });
    }
    const { isEmail } = channelInfo;
    const normalizedIdentifier = isEmail
      ? cleanIdentifier.toLowerCase()
      : cleanIdentifier;

    // Look up existing user (prioritizing technician role)
    let user = await otpService.findUserByIdentifier(
      normalizedIdentifier,
      "technician",
    );

    // If password was provided, verify credentials
    if (password) {
      if (!user) {
        return res.status(401).json({
          error:
            "No partner account found with this email or mobile number. Please register as a professional.",
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Invalid password for this partner account.",
        });
      }
    }

    // Role check: if user exists, verify they have professional access
    if (user && user.role !== "technician" && user.role !== "admin") {
      return res.status(403).json({
        error:
          "This account is registered as a customer. Please use customer sign-in or register as a professional.",
      });
    }

    // If no user exists yet (e.g. registration flow OTP), create pending professional record
    if (!user) {
      const newUserId = uuidv4();
      const userEmail = isEmail
        ? normalizedIdentifier
        : `partner_${newUserId.slice(0, 8)}@temp.argentyour.com`;
      const userPhone = isEmail ? null : normalizedIdentifier;

      await query.run(
        `INSERT INTO users (id, name, email, password_hash, role, phone)
         VALUES (?, ?, ?, ?, 'technician', ?)`,
        [
          newUserId,
          "New Professional Partner",
          userEmail,
          bcrypt.hashSync(uuidv4(), 8),
          userPhone,
        ],
      );

      user = await query.get("SELECT * FROM users WHERE id = ?", [newUserId]);
    }

    // Generate secure 6-digit OTP and dispatch via real email / SMS service
    const otpResult = await otpService.createOtpSession(
      user,
      normalizedIdentifier,
    );

    if (!otpResult.success) {
      return res.status(otpResult.rateLimited ? 429 : 503).json({
        error:
          otpResult.error ||
          "Unable to send the verification code right now. Please try again or use email verification.",
        retryAfterSeconds: otpResult.retryAfterSeconds,
      });
    }

    return res.json({
      success: true,
      status: "OTP_REQUIRED",
      message:
        otpResult.deliveryMode === "development_log"
          ? "Verification code created for local development testing."
          : "Verification code sent successfully",
      channel: otpResult.channel,
      maskedDestination: otpResult.maskedDestination,
      tempSessionToken: otpResult.tempSessionToken,
      cooldownSeconds: otpResult.cooldownSeconds || 60,
      expiresInSeconds: otpResult.expiresInSeconds || 300,
    });
  } catch (err) {
    console.error("❌ [Professional Auth] Error in send-otp:", err);
    return res.status(500).json({
      error:
        "Unable to send the verification code right now. Please try again later.",
    });
  }
};

router.post("/send-otp", handleSendOtp);
router.post("/send-code", handleSendOtp);

/**
 * POST /api/professional/auth/verify-otp and /verify-code
 * Validates 6-digit OTP, checks expiration & attempts, authenticates professional session
 */
const handleVerifyOtp = async (req, res) => {
  try {
    const { tempSessionToken, identifier, otp, code } = req.body;
    const sessionRef = tempSessionToken || identifier;
    const cleanOtp = String(code || otp || "").trim();

    if (!sessionRef || !cleanOtp) {
      return res.status(400).json({
        error: "Verification code and session identifier are required.",
      });
    }

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        error: "Please enter the complete 6-digit numeric verification code.",
      });
    }

    // Verify OTP against stored bcrypt hash, expiry, and attempt limits
    const verifyResult = await otpService.verifyOtp(sessionRef, cleanOtp);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error,
        remainingAttempts: verifyResult.remainingAttempts,
      });
    }

    const user = verifyResult.user;

    // Verify account has professional privileges
    if (user.role !== "technician" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "This account is not authorized as a service professional.",
      });
    }

    // Retrieve or provision technician profile
    let technicianData = await query.get(
      "SELECT * FROM technicians WHERE user_id = ?",
      [user.id],
    );

    if (!technicianData && user.role === "technician") {
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

    // Generate JWT token
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
        avatar: user.avatar,
        technician: technicianData,
      },
    });
  } catch (err) {
    console.error("❌ [Professional Auth] Error in verify-otp:", err);
    return res.status(500).json({
      error: "Failed to verify authentication code. Please try again.",
    });
  }
};

router.post("/verify-otp", handleVerifyOtp);
router.post("/verify-code", handleVerifyOtp);

/**
 * POST /api/professional/auth/resend-otp and /resend-code
 * Generates a new OTP, invalidates previous OTP, enforces 60-second cooldown
 */
const handleResendOtp = async (req, res) => {
  try {
    const { tempSessionToken, identifier } = req.body;
    const sessionRef = tempSessionToken || identifier;

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
        error: resendResult.error,
        cooldownRemaining: resendResult.cooldownRemaining,
        retryAfterSeconds: resendResult.retryAfterSeconds,
      });
    }

    return res.json({
      success: true,
      message:
        resendResult.deliveryMode === "development_log"
          ? "A fresh verification code was created for local development testing."
          : "A fresh verification code has been sent.",
      channel: resendResult.channel,
      maskedDestination: resendResult.maskedDestination,
      tempSessionToken: resendResult.tempSessionToken || tempSessionToken,
      cooldownSeconds: resendResult.cooldownSeconds || 60,
      expiresInSeconds: resendResult.expiresInSeconds || 300,
    });
  } catch (err) {
    console.error("❌ [Professional Auth] Error in resend-otp:", err);
    return res.status(500).json({
      error: "Failed to resend verification code. Please try again later.",
    });
  }
};

router.post("/resend-otp", handleResendOtp);
router.post("/resend-code", handleResendOtp);

/**
 * POST /api/professional/auth/login
 * Direct Professional login with Email or Phone + Password (No OTP)
 */
const handleProfessionalLogin = async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const inputIdentifier = (identifier || email || phone || "").trim();

    if (!inputIdentifier || !password) {
      return res.status(400).json({
        error: "Please enter your registered email/phone and password.",
      });
    }

    const user = await otpService.findUserByIdentifier(
      inputIdentifier,
      "technician",
    );
    if (!user) {
      return res.status(401).json({
        error:
          "No partner account found with this email or mobile number. Please verify or register as a professional.",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid password for this partner account.",
      });
    }

    // Role check: Ensure user is a technician or admin
    if (user.role !== "technician" && user.role !== "admin") {
      return res.status(403).json({
        error:
          "This account is registered as a customer. Please use Customer login or register as a professional.",
      });
    }

    let technicianData = await query.get(
      "SELECT * FROM technicians WHERE user_id = ?",
      [user.id],
    );

    if (!technicianData && user.role === "technician") {
      const techId = uuidv4();
      await query.run(
        `INSERT INTO technicians (id, user_id, category, latitude, longitude, is_online, rating, total_jobs, status)
         VALUES (?, ?, 'Plumbing', 28.6139, 77.2090, 0, 4.9, 0, 'Approved')`,
        [techId, user.id],
      );
      technicianData = await query.get(
        "SELECT * FROM technicians WHERE id = ?",
        [techId],
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
    console.error("❌ [Professional Auth] Login error:", err);
    return res
      .status(500)
      .json({ error: "Failed to authenticate professional." });
  }
};

router.post("/login", handleProfessionalLogin);

/**
 * POST /api/professional/auth/forgot-password
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { identifier, email, phone } = req.body;
    const rawIdentifier = (identifier || email || phone || "").trim();
    if (!rawIdentifier) {
      return res.status(400).json({
        error: "Please enter your registered email address or mobile number.",
      });
    }

    const user = await otpService.findUserByIdentifier(
      rawIdentifier,
      "technician",
    );
    if (!user || (user.role !== "technician" && user.role !== "admin")) {
      return res.status(404).json({
        error: "No partner account found with this email or mobile number.",
      });
    }

    const otpResult = await otpService.createOtpSession(user, rawIdentifier);
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
      message: "Verification code sent to your registered contact.",
      tempSessionToken: otpResult.tempSessionToken,
      channel: otpResult.channel,
      maskedDestination: otpResult.maskedDestination,
      cooldownSeconds: otpResult.cooldownSeconds || 60,
      expiresInSeconds: otpResult.expiresInSeconds || 300,
    });
  } catch (err) {
    console.error("❌ [Professional Auth] Forgot password error:", err);
    return res.status(500).json({
      error: "Unable to process password reset request. Please try again.",
    });
  }
});

/**
 * POST /api/professional/auth/reset-password
 */
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
      confirmPassword,
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

    if (confirmPassword && effectiveNewPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New password and Confirm Password do not match.",
      });
    }

    const verifyResult = await otpService.verifyOtp(sessionRef, inputCode);
    if (!verifyResult.success) {
      return res.status(400).json({
        error:
          verifyResult.error || "Invalid verification code. Please try again.",
        remainingAttempts: verifyResult.remainingAttempts,
      });
    }

    const user = verifyResult.user;
    if (user.role !== "technician" && user.role !== "admin") {
      return res.status(403).json({
        error: "This account is not authorized as a service professional.",
      });
    }

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
    console.error("❌ [Professional Auth] Reset password error:", err);
    return res
      .status(500)
      .json({ error: "Failed to reset password. Please try again." });
  }
});

export default router;
