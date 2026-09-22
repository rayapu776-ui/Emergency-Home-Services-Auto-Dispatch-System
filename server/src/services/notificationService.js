import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

/**
 * Builds professional branded HTML email for OTP delivery
 */
function buildOtpEmailTemplate(code, userName = "Valued Customer") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Argent Your - Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f8f6; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f8f6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 20px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">Argent Your</h1>
              <p style="margin: 6px 0 0; font-size: 12px; font-weight: 700; color: #167257; text-transform: uppercase; letter-spacing: 1.5px;">Two-Step Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #334155;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #475569;">
                Use the following 6-digit authentication code to verify your sign-in to your Argent Your account:
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 14px; padding: 22px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #15803d; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 10px;">
                  ${code}
                </span>
              </div>

              <p style="margin: 0 0 8px; font-size: 13px; line-height: 20px; color: #64748b;">
                ⏱ <strong>Expires in 5 minutes.</strong>
              </p>
              <p style="margin: 0 0 24px; font-size: 13px; line-height: 20px; color: #64748b;">
                🛡 For your security, never share this code or your account password with anyone.
              </p>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px;" />

              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8; text-align: center;">
                If you did not request this verification code, please ignore this email or review your account security settings.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 18px 36px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} Argent Your. Premium Doorstep Emergency & Home Services.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export const notificationService = {
  /**
   * Check if Email provider (SMTP) is configured
   */
  isEmailConfigured() {
    const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PASS } = process.env;
    return Boolean(SMTP_HOST && SMTP_USER && (SMTP_PASSWORD || SMTP_PASS));
  },

  /**
   * Check if SMS provider (Twilio) is configured
   */
  isSmsConfigured() {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } =
      process.env;
    return Boolean(
      TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER,
    );
  },

  /**
   * Send 6-digit OTP code to destination via real configured provider
   * @param {Object} params
   * @param {"email" | "sms"} params.channel
   * @param {string} params.destination - Plain email address or phone number
   * @param {string} params.code - 6-digit OTP string
   * @param {string} params.userName - Optional recipient name
   * @returns {Promise<{ success: boolean, channel: string, destination: string, error?: string, reason?: string }>}
   */
  async sendOtp({ channel, destination, code, userName = "Argent Your User" }) {
    if (channel === "email") {
      return await this.sendEmailOtp({ destination, code, userName });
    } else if (channel === "sms") {
      return await this.sendSmsOtp({ destination, code, userName });
    } else {
      return {
        success: false,
        error: "Invalid delivery channel specified",
        reason: `Unsupported channel: ${channel}`,
      };
    }
  },

  /**
   * Send Email OTP via Nodemailer SMTP
   */
  async sendEmailOtp({ destination, code, userName = "Partner" }) {
    const {
      SMTP_SERVICE,
      SMTP_HOST,
      SMTP_PORT = 587,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
      SMTP_PASSWORD,
      SMTP_FROM,
      EMAIL_FROM,
      DEV_LOG_OTP,
      NODE_ENV,
    } = process.env;

    const smtpPassword = SMTP_PASSWORD || SMTP_PASS;
    const fromAddress =
      EMAIL_FROM ||
      SMTP_FROM ||
      (SMTP_USER
        ? `"Argent Your Verification" <${SMTP_USER}>`
        : '"Argent Your Verification" <noreply@argentyour.com>');

    let transporter = null;

    // Check if real SMTP is configured
    if (SMTP_USER && smtpPassword) {
      const transportConfig = {
        auth: {
          user: SMTP_USER,
          pass: smtpPassword,
        },
      };

      if (SMTP_SERVICE) {
        transportConfig.service = SMTP_SERVICE;
      } else if (SMTP_HOST?.toLowerCase().includes("gmail")) {
        transportConfig.service = "gmail";
      } else if (SMTP_HOST) {
        transportConfig.host = SMTP_HOST;
        transportConfig.port = Number(SMTP_PORT) || 587;
        transportConfig.secure =
          SMTP_SECURE === "true" || Number(SMTP_PORT) === 465;
      } else {
        return {
          success: false,
          error:
            "Unable to send the verification code right now. Please try again or use another verification method.",
          reason: "SMTP host or service is missing",
        };
      }

      transportConfig.tls = {
        rejectUnauthorized: false,
      };

      try {
        transporter = nodemailer.createTransport(transportConfig);
      } catch (tErr) {
        console.error(
          "❌ [Nodemailer] Transporter creation failed:",
          tErr.message,
        );
      }
    }

    if (!transporter) {
      if (
        NODE_ENV !== "production" &&
        (DEV_LOG_OTP !== "false" || DEV_ALLOW_SIMULATED_OTP === "true")
      ) {
        console.log("\n" + "=".repeat(70));
        console.log("🔒 [AUTH CODE LOCAL VERIFICATION GATEWAY - EMAIL]");
        console.log(`👤 Recipient:   ${userName}`);
        console.log(`📧 Destination: ${destination}`);
        console.log(`🔑 Auth Code:   ${code}`);
        console.log("⏱ Valid for:   5 minutes");
        console.log(
          "This is development-only server logging; no email was sent.",
        );
        console.log("=".repeat(70) + "\n");

        return {
          success: true,
          channel: "email",
          destination,
          deliveryMode: "development_log",
        };
      }

      return {
        success: false,
        error:
          "Unable to send the verification code right now. Please try again or contact support.",
        reason: "SMTP provider not configured",
      };
    }

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: destination,
        subject: `${code} is your Argent Your verification code`,
        text: `Your Argent Your verification code is: ${code}. Valid for 5 minutes. Do not share this code.`,
        html: buildOtpEmailTemplate(code, userName),
      });

      console.log("\n" + "=".repeat(70));
      console.log("✅ [REAL EMAIL OTP DELIVERED TO INBOX]");
      console.log(`👤 Recipient:  ${userName}`);
      console.log(`📧 Destination: ${destination}`);
      console.log(`🆔 Message ID:  ${info.messageId}`);
      console.log("=".repeat(70) + "\n");

      return {
        success: true,
        channel: "email",
        destination,
        messageId: info.messageId,
      };
    } catch (err) {
      console.error("\n" + "=".repeat(70));
      console.error("❌ [EMAIL OTP DELIVERY ERROR]");
      console.error(`Destination: ${destination}`);
      console.error(`Error Details: ${err.message}`);
      console.error("=".repeat(70) + "\n");

      return {
        success: false,
        error:
          "Unable to send the verification code right now. Please try again or contact support.",
        reason: err.message,
      };
    }
  },

  /**
   * Send SMS OTP via Twilio
   */
  async sendSmsOtp({ destination, code, userName = "Partner" }) {
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER,
      DEFAULT_COUNTRY_CODE = "+91",
      DEV_LOG_OTP,
      DEV_ALLOW_SIMULATED_OTP,
      NODE_ENV,
    } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      if (
        NODE_ENV !== "production" &&
        (DEV_LOG_OTP !== "false" || DEV_ALLOW_SIMULATED_OTP === "true")
      ) {
        console.log("\n" + "=".repeat(70));
        console.log("🔒 [AUTH CODE LOCAL VERIFICATION GATEWAY - SMS]");
        console.log(`👤 Recipient:   ${userName}`);
        console.log(`📱 Destination: ${destination}`);
        console.log(`🔑 Auth Code:   ${code}`);
        console.log("⏱ Valid for:   5 minutes");
        console.log(
          "This is development-only server logging; no SMS was sent.",
        );
        console.log("=".repeat(70) + "\n");

        return {
          success: true,
          channel: "sms",
          destination,
          deliveryMode: "development_log",
        };
      }

      return {
        success: false,
        error:
          "Unable to send the verification code right now. Please try again or use email verification.",
        reason: "SMS provider not configured",
      };
    }

    try {
      // Normalize destination to E.164
      let formattedPhone = destination.trim().replace(/[\s()-]/g, "");
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = `${DEFAULT_COUNTRY_CODE}${formattedPhone}`;
      }

      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      const message = await client.messages.create({
        body: `Your Argent Your verification code is: ${code}. Valid for 5 minutes. Do not share this code.`,
        from: TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });

      console.log("\n" + "=".repeat(70));
      console.log("✅ [REAL SMS OTP DISPATCHED]");
      console.log(`👤 Recipient:  ${userName}`);
      console.log(`📱 Destination: ${formattedPhone}`);
      console.log(`🆔 Twilio SID:   ${message.sid}`);
      console.log("=".repeat(70) + "\n");

      return {
        success: true,
        channel: "sms",
        destination: formattedPhone,
        sid: message.sid,
      };
    } catch (err) {
      console.error("\n" + "=".repeat(70));
      console.error("❌ [SMS OTP DELIVERY ERROR]");
      console.error(`Destination: ${destination}`);
      console.error(`Error Details: ${err.message}`);
      console.error("=".repeat(70) + "\n");

      return {
        success: false,
        error:
          "Unable to send the verification code right now. Please try again or use email verification.",
        reason: err.message,
      };
    }
  },
};

export default notificationService;
