import crypto from "crypto";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import notificationService from "./notificationService.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 5;

/**
 * Clean phone numbers to digits only for normalized matching
 * e.g. "+91 98111 23456" -> "9811123456" (or last 10 digits)
 */
function normalizePhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  // Return last 10 digits if country code is prepended
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export const otpService = {
  /**
   * Generates a cryptographically secure 6-digit numeric OTP
   */
  generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  },

  /**
   * Formats masked destination for display on client UI
   * e.g. "c***@demo.com" or "******2345"
   */
  maskDestination(channel, destination) {
    if (!destination) return "******";
    if (channel === "email" || destination.includes("@")) {
      const [name, domain] = destination.split("@");
      if (!domain) return destination;
      if (name.length <= 2) {
        return `${name[0]}***@${domain}`;
      }
      return `${name[0]}***${name[name.length - 1]}@${domain}`;
    } else {
      const digits = destination.replace(/\D/g, "");
      if (digits.length <= 4) {
        return `******${digits}`;
      }
      const lastFour = digits.slice(-4);
      return `******${lastFour}`;
    }
  },

  /**
   * Look up user by either email or phone number
   * @param {string} identifier
   */
  async findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const raw = identifier.trim();

    if (raw.includes("@")) {
      return await query.get(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
        [raw],
      );
    }

    // Attempt phone matching
    const rawDigits = raw.replace(/\D/g, "");
    if (!rawDigits) return null;
    const normalized = normalizePhone(raw);

    // First try direct match
    let user = await query.get(
      "SELECT * FROM users WHERE phone = ? OR phone LIKE ?",
      [raw, `%${normalized}`],
    );

    if (!user) {
      // Fetch all users with non-null phone to match normalized digits
      const allUsersWithPhone = await query.all(
        "SELECT * FROM users WHERE phone IS NOT NULL AND phone != ''",
      );
      user = allUsersWithPhone.find((u) => {
        const uNormalized = normalizePhone(u.phone);
        return uNormalized === normalized || u.phone.includes(rawDigits);
      });
    }

    return user || null;
  },

  /**
   * Create a new OTP session for a user and dispatch the code
   */
  async createOtpSession(user, rawIdentifier) {
    const isEmail = rawIdentifier.includes("@");
    const channel = isEmail ? "email" : "sms";
    const destination = isEmail ? user.email : user.phone || user.email;

    const plainOtp = this.generateOtp();

    // Dispatch via real configured provider first
    const sendResult = await notificationService.sendOtp({
      channel,
      destination,
      code: plainOtp,
      userName: user.name,
    });

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error || "Unable to send authentication code. Please try again.",
        reason: sendResult.reason,
      };
    }

    // Remove any previous active sessions for this user
    await query.run("DELETE FROM otp_sessions WHERE user_id = ?", [user.id]);

    const otpHash = bcrypt.hashSync(plainOtp, 8);
    const sessionId = uuidv4();
    const now = Date.now();
    const cooldownUntil = now + COOLDOWN_MS;
    const expiresAt = now + OTP_EXPIRY_MS;

    await query.run(
      `INSERT INTO otp_sessions (id, user_id, otp_hash, channel, destination, attempts, cooldown_until, expires_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [sessionId, user.id, otpHash, channel, destination, cooldownUntil, expiresAt],
    );

    return {
      success: true,
      tempSessionToken: sessionId,
      channel,
      maskedDestination: this.maskDestination(channel, destination),
      cooldownSeconds: Math.ceil(COOLDOWN_MS / 1000),
      expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
    };
  },

  /**
   * Verify an OTP session code
   */
  async verifyOtp(tempSessionToken, inputCode) {
    if (!tempSessionToken || !inputCode) {
      return {
        success: false,
        error: "Verification code and session token are required",
      };
    }

    const session = await query.get("SELECT * FROM otp_sessions WHERE id = ?", [
      tempSessionToken,
    ]);

    if (!session) {
      return {
        success: false,
        error: "This code has expired. Please request a new code.",
      };
    }

    const now = Date.now();
    if (now > session.expires_at) {
      await query.run("DELETE FROM otp_sessions WHERE id = ?", [
        tempSessionToken,
      ]);
      return {
        success: false,
        error: "This code has expired. Please request a new code.",
      };
    }

    if (session.attempts >= MAX_ATTEMPTS) {
      await query.run("DELETE FROM otp_sessions WHERE id = ?", [
        tempSessionToken,
      ]);
      return {
        success: false,
        error: "Too many incorrect attempts. Please sign in again.",
      };
    }

    const cleanInput = inputCode.trim();
    const isMatch = bcrypt.compareSync(cleanInput, session.otp_hash);

    if (!isMatch) {
      const newAttempts = session.attempts + 1;
      const remainingAttempts = Math.max(0, MAX_ATTEMPTS - newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        await query.run("DELETE FROM otp_sessions WHERE id = ?", [
          tempSessionToken,
        ]);
        return {
          success: false,
          error: "Too many incorrect attempts. Please sign in again.",
        };
      }

      await query.run("UPDATE otp_sessions SET attempts = ? WHERE id = ?", [
        newAttempts,
        tempSessionToken,
      ]);

      return {
        success: false,
        error: `Invalid authentication code. (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining)`,
        remainingAttempts,
      };
    }

    // OTP matched successfully: destroy session for single-use security
    await query.run("DELETE FROM otp_sessions WHERE id = ?", [
      tempSessionToken,
    ]);

    const user = await query.get("SELECT * FROM users WHERE id = ?", [
      session.user_id,
    ]);

    return {
      success: true,
      user,
    };
  },

  /**
   * Resend a fresh OTP for an active session
   */
  async resendOtp(tempSessionToken) {
    if (!tempSessionToken) {
      return { success: false, error: "Session token is required" };
    }

    const session = await query.get("SELECT * FROM otp_sessions WHERE id = ?", [
      tempSessionToken,
    ]);

    if (!session) {
      return {
        success: false,
        error: "Session expired or invalid. Please sign in again.",
      };
    }

    const now = Date.now();
    if (session.cooldown_until > now) {
      const waitSeconds = Math.ceil((session.cooldown_until - now) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds}s before requesting a new code.`,
        cooldownRemaining: waitSeconds,
      };
    }

    const user = await query.get("SELECT * FROM users WHERE id = ?", [
      session.user_id,
    ]);

    if (!user) {
      return { success: false, error: "Associated user not found" };
    }

    const plainOtp = this.generateOtp();

    // Dispatch via real provider first
    const sendResult = await notificationService.sendOtp({
      channel: session.channel,
      destination: session.destination,
      code: plainOtp,
      userName: user.name,
    });

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error || "Unable to send authentication code. Please try again.",
        reason: sendResult.reason,
      };
    }

    const otpHash = bcrypt.hashSync(plainOtp, 8);
    const cooldownUntil = now + COOLDOWN_MS;
    const expiresAt = now + OTP_EXPIRY_MS;

    await query.run(
      `UPDATE otp_sessions 
       SET otp_hash = ?, attempts = 0, cooldown_until = ?, expires_at = ?
       WHERE id = ?`,
      [otpHash, cooldownUntil, expiresAt, tempSessionToken],
    );

    return {
      success: true,
      channel: session.channel,
      maskedDestination: this.maskDestination(
        session.channel,
        session.destination,
      ),
      cooldownSeconds: Math.ceil(COOLDOWN_MS / 1000),
      expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
    };
  },
};

export default otpService;
