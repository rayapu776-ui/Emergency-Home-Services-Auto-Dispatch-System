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
                ⏱ <strong>Expires in 10 minutes.</strong>
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
    const { SMTP_HOST, SMTP_USER, SMTP_PASS, ENABLE_ETHEREAL_DEV } = process.env;
    return Boolean((SMTP_HOST && SMTP_USER && SMTP_PASS) || ENABLE_ETHEREAL_DEV === "true");
  },

  /**
   * Check if SMS provider (Twilio) is configured
   */
  isSmsConfigured() {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
    return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
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
  async sendEmailOtp({ destination, code, userName }) {
    const {
      SMTP_HOST,
      SMTP_PORT = 587,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
      SMTP_FROM = '"Argent Your Verification" <noreply@argentyour.com>',
      ENABLE_ETHEREAL_DEV,
    } = process.env;

    let transporter;

    // Check if real SMTP is configured
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    } else if (ENABLE_ETHEREAL_DEV === "true") {
      // Local development test account on Ethereal
      try {
        console.log("ℹ️ [Nodemailer] Generating Ethereal SMTP test account for localhost development...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (etherealErr) {
        console.error("❌ [Nodemailer] Failed creating Ethereal test account:", etherealErr.message);
      }
    }

    if (!transporter) {
      console.error("\n" + "=".repeat(70));
      console.error("❌ [EMAIL OTP DELIVERY FAILURE - PROVIDER NOT CONFIGURED]");
      console.error(`Target Recipient: ${destination}`);
      console.error("Reason: SMTP Email provider credentials are not configured in server/.env.");
      console.error("To enable real email OTP delivery, configure the following in server/.env:");
      console.error("  - SMTP_HOST (e.g. smtp.gmail.com or smtp.sendgrid.net)");
      console.error("  - SMTP_PORT (e.g. 587 or 465)");
      console.error("  - SMTP_USER (e.g. your-email@gmail.com)");
      console.error("  - SMTP_PASS (e.g. your 16-character Google App Password)");
      console.error("  - SMTP_FROM (e.g. \"Argent Your\" <your-email@gmail.com>)");
      console.error("=".repeat(70) + "\n");

      return {
        success: false,
        error: "Unable to send authentication code. Please try again.",
        reason: "Email provider credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured in server/.env.",
      };
    }

    try {
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        to: destination,
        subject: `${code} is your Argent Your verification code`,
        text: `Your Argent Your verification code is: ${code}. Valid for 10 minutes. Do not share this code.`,
        html: buildOtpEmailTemplate(code, userName),
      });

      console.log("\n" + "=".repeat(70));
      console.log("✅ [REAL EMAIL OTP DELIVERED TO INBOX]");
      console.log(`👤 Recipient:  ${userName}`);
      console.log(`📧 Destination: ${destination}`);
      console.log(`🆔 Message ID:  ${info.messageId}`);
      if (ENABLE_ETHEREAL_DEV === "true") {
        console.log(`🔗 Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
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
        error: "Unable to send authentication code. Please try again.",
        reason: err.message,
      };
    }
  },

  /**
   * Send SMS OTP via Twilio
   */
  async sendSmsOtp({ destination, code, userName }) {
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER,
      DEFAULT_COUNTRY_CODE = "+91",
    } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("\n" + "=".repeat(70));
      console.error("❌ [SMS OTP DELIVERY FAILURE - PROVIDER NOT CONFIGURED]");
      console.error(`Target Recipient: ${destination}`);
      console.error("Reason: Twilio SMS credentials are not configured in server/.env.");
      console.error("To enable real SMS delivery, configure the following in server/.env:");
      console.error("  - TWILIO_ACCOUNT_SID (e.g. ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)");
      console.error("  - TWILIO_AUTH_TOKEN (e.g. your_auth_token)");
      console.error("  - TWILIO_PHONE_NUMBER (e.g. +1234567890)");
      console.error("  - DEFAULT_COUNTRY_CODE (e.g. +91 or +1)");
      console.error("=".repeat(70) + "\n");

      return {
        success: false,
        error: "Unable to send authentication code. Please try again.",
        reason: "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are not configured in server/.env.",
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
        body: `Your Argent Your verification code is: ${code}. Valid for 10 minutes. Do not share this code.`,
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
        error: "Unable to send authentication code. Please try again.",
        reason: err.message,
      };
    }
  },
};

export default notificationService;
