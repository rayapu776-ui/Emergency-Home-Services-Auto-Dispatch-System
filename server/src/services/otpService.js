import crypto from "crypto";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database.js";
import notificationService from "./notificationService.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const BCRYPT_ROUNDS = 12;
const MAX_SENDS_PER_WINDOW = 4;
const SEND_WINDOW_MS = 15 * 60 * 1000;

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
  async getSendRateLimit(userId) {
    const now = Date.now();
    const limit = await query.get(
      "SELECT * FROM otp_send_limits WHERE subject = ?",
      [userId],
    );
    if (!limit || now - limit.window_started_at >= SEND_WINDOW_MS) {
      return { allowed: true };
    }
    if (limit.send_count >= MAX_SENDS_PER_WINDOW) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(
          (SEND_WINDOW_MS - (now - limit.window_started_at)) / 1000,
        ),
      };
    }
    return { allowed: true };
  },

  async recordOtpSend(userId) {
    const now = Date.now();
    const limit = await query.get(
      "SELECT * FROM otp_send_limits WHERE subject = ?",
      [userId],
    );
    if (!limit) {
      await query.run(
        "INSERT INTO otp_send_limits (subject, window_started_at, send_count) VALUES (?, ?, 1)",
        [userId, now],
      );
    } else if (now - limit.window_started_at >= SEND_WINDOW_MS) {
      await query.run(
        "UPDATE otp_send_limits SET window_started_at = ?, send_count = 1 WHERE subject = ?",
        [now, userId],
      );
    } else {
      await query.run(
        "UPDATE otp_send_limits SET send_count = send_count + 1 WHERE subject = ?",
        [userId],
      );
    }
  },

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
      const lastFour = digits.length >= 4 ? digits.slice(-4) : digits;
      const countryCode = destination.trim().startsWith("+")
        ? destination.trim().split(" ")[0].slice(0, 3)
        : "+91";
      return `${countryCode} ******${lastFour}`;
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
    const destination = rawIdentifier.trim();

    const plainOtp = this.generateOtp();
    const sendLimit = await this.getSendRateLimit(user.id);
    if (!sendLimit.allowed) {
      return {
        success: false,
        rateLimited: true,
        retryAfterSeconds: sendLimit.retryAfterSeconds,
        error:
          "Too many verification codes have been requested. Please try again later.",
      };
    }

    // Persist the hash before delivery so a delivered code always has a server-side session.
    // Verified sessions are retained as a minimal audit marker; pending sessions are invalidated.
    await query.run(
      "DELETE FROM otp_sessions WHERE user_id = ? AND verified_at IS NULL",
      [user.id],
    );

    const otpHash = bcrypt.hashSync(plainOtp, BCRYPT_ROUNDS);
    const sessionId = uuidv4();
    const now = Date.now();
    const cooldownUntil = now + COOLDOWN_MS;
    const expiresAt = now + OTP_EXPIRY_MS;

    await query.run(
      `INSERT INTO otp_sessions (id, user_id, otp_hash, channel, destination, attempts, cooldown_until, expires_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        sessionId,
        user.id,
        otpHash,
        channel,
        destination,
        cooldownUntil,
        expiresAt,
      ],
    );

    const sendResult = await notificationService.sendOtp({
      channel,
      destination,
      code: plainOtp,
      userName: user.name,
    });

    if (!sendResult.success) {
      // Never leave a code usable when delivery was not accepted by a provider.
      await query.run("DELETE FROM otp_sessions WHERE id = ?", [sessionId]);
      return {
        success: false,
        error:
          sendResult.error ||
          "Unable to send the verification code right now. Please try again.",
      };
    }

    await this.recordOtpSend(user.id);

    return {
      success: true,
      tempSessionToken: sessionId,
      channel,
      maskedDestination: this.maskDestination(channel, destination),
      cooldownSeconds: Math.ceil(COOLDOWN_MS / 1000),
      expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
      deliveryMode: sendResult.deliveryMode,
    };
  },

  /**
   * Find an active, unexpired, unverified OTP session by session ID, destination, or user identifier
   */
  async findActiveSession(tokenOrIdentifier) {
    if (!tokenOrIdentifier) return null;
    const raw = String(tokenOrIdentifier).trim();

    // 1. Try finding directly by session ID
    let session = await query.get("SELECT * FROM otp_sessions WHERE id = ?", [
      raw,
    ]);
    if (session) return session;

    // 2. Try finding active pending session by destination (case-insensitive)
    session = await query.get(
      "SELECT * FROM otp_sessions WHERE LOWER(destination) = LOWER(?) AND verified_at IS NULL ORDER BY expires_at DESC LIMIT 1",
      [raw],
    );
    if (session) return session;

    // 3. Try finding user first, then active pending session for user
    const user = await this.findUserByIdentifier(raw);
    if (user) {
      session = await query.get(
        "SELECT * FROM otp_sessions WHERE user_id = ? AND verified_at IS NULL ORDER BY expires_at DESC LIMIT 1",
        [user.id],
      );
      if (session) return session;
    }

    return null;
  },

  /**
   * Verify an OTP session code
   */
  async verifyOtp(sessionRef, inputCode) {
    if (!sessionRef || !inputCode) {
      return {
        success: false,
        error: "Verification code and session token are required",
      };
    }

    const session = await this.findActiveSession(sessionRef);

    if (!session) {
      return {
        success: false,
        error: "This verification code has expired. Please request a new code.",
      };
    }

    const now = Date.now();
    if (session.verified_at) {
      return {
        success: false,
        error:
          "This verification code has already been used. Please sign in again.",
      };
    }

    if (now > session.expires_at) {
      await query.run("DELETE FROM otp_sessions WHERE id = ?", [session.id]);
      return {
        success: false,
        error: "This verification code has expired. Please request a new code.",
      };
    }

    if (session.attempts >= MAX_ATTEMPTS) {
      await query.run("DELETE FROM otp_sessions WHERE id = ?", [session.id]);
      return {
        success: false,
        error: "Too many attempts. Please request a new code.",
      };
    }

    const cleanInput = inputCode.trim();
    const isMatch = bcrypt.compareSync(cleanInput, session.otp_hash);

    if (!isMatch) {
      const newAttempts = session.attempts + 1;
      const remainingAttempts = Math.max(0, MAX_ATTEMPTS - newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        await query.run("DELETE FROM otp_sessions WHERE id = ?", [session.id]);
        return {
          success: false,
          error: "Too many attempts. Please request a new code.",
        };
      }

      await query.run("UPDATE otp_sessions SET attempts = ? WHERE id = ?", [
        newAttempts,
        session.id,
      ]);

      return {
        success: false,
        error: "Invalid verification code. Please try again.",
        remainingAttempts,
      };
    }

    // Mark and invalidate the code so it cannot be replayed, while retaining an audit marker.
    await query.run(
      "UPDATE otp_sessions SET verified_at = ?, otp_hash = ? WHERE id = ?",
      [now, bcrypt.hashSync(crypto.randomUUID(), BCRYPT_ROUNDS), session.id],
    );

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
  async resendOtp(sessionRef) {
    if (!sessionRef) {
      return {
        success: false,
        error: "Session token or identifier is required",
      };
    }

    const session = await this.findActiveSession(sessionRef);

    if (!session) {
      return {
        success: false,
        error: "Session expired or invalid. Please sign in again.",
      };
    }

    const now = Date.now();
    if (session.verified_at || now > session.expires_at) {
      return {
        success: false,
        error: "Session expired or invalid. Please sign in again.",
      };
    }

    if (session.cooldown_until > now) {
      const waitSeconds = Math.ceil((session.cooldown_until - now) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds}s before requesting a new code.`,
        cooldownRemaining: waitSeconds,
      };
    }

    if (session.resend_count >= MAX_RESENDS) {
      return {
        success: false,
        error:
          "Resend limit reached. Please sign in again to request a new code.",
      };
    }

    const user = await query.get("SELECT * FROM users WHERE id = ?", [
      session.user_id,
    ]);

    if (!user) {
      return { success: false, error: "Associated user not found" };
    }

    const plainOtp = this.generateOtp();
    const sendLimit = await this.getSendRateLimit(user.id);
    if (!sendLimit.allowed) {
      return {
        success: false,
        rateLimited: true,
        retryAfterSeconds: sendLimit.retryAfterSeconds,
        error:
          "Too many verification codes have been requested. Please try again later.",
      };
    }

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
        error:
          sendResult.error ||
          "Unable to send authentication code. Please try again.",
        reason: sendResult.reason,
      };
    }

    await this.recordOtpSend(user.id);

    const otpHash = bcrypt.hashSync(plainOtp, BCRYPT_ROUNDS);
    const cooldownUntil = now + COOLDOWN_MS;
    const expiresAt = now + OTP_EXPIRY_MS;

    await query.run(
      `UPDATE otp_sessions 
       SET otp_hash = ?, attempts = 0, resend_count = resend_count + 1,
           cooldown_until = ?, expires_at = ?
       WHERE id = ?`,
      [otpHash, cooldownUntil, expiresAt, session.id],
    );

    return {
      success: true,
      tempSessionToken: session.id,
      channel: session.channel,
      maskedDestination: this.maskDestination(
        session.channel,
        session.destination,
      ),
      cooldownSeconds: Math.ceil(COOLDOWN_MS / 1000),
      expiresInSeconds: Math.ceil(OTP_EXPIRY_MS / 1000),
      deliveryMode: sendResult.deliveryMode,
    };
  },
};

export default otpService;
