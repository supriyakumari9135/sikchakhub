import 'dotenv/config';
import nodemailer, { Transporter } from 'nodemailer';

export interface SendEmailOtpOptions {
  to: string;
  otp: string;
  userName?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      try {
        if (host === 'smtp.gmail.com' || user.endsWith('@gmail.com')) {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
          });
        } else {
          this.transporter = nodemailer.createTransport({
            host: host || 'smtp.gmail.com',
            port,
            secure: port === 465,
            auth: { user, pass },
            tls: {
              rejectUnauthorized: process.env.NODE_ENV === 'production',
            },
          });
        }
        this.isConfigured = true;
        console.log(`✅ SMTP Email Service initialized with Gmail/SMTP user: ${user}`);
      } catch (err: any) {
        console.warn('⚠️ SMTP Transporter configuration warning:', err.message);
        this.isConfigured = false;
      }
    } else {
      console.info('ℹ️ SMTP credentials not provided in .env. Email OTP will operate in development fallback mode.');
      this.isConfigured = false;
    }
  }

  public isEmailConfigured(): boolean {
    if (!this.isConfigured) {
      this.initTransporter();
    }
    return this.isConfigured && this.transporter !== null;
  }

  /**
   * Send Email OTP to registered user address
   * Enforces exact prompt requirement:
   * "Your SikchakHub verification code is [OTP]. It is valid for 5 minutes. Do not share this code with anyone."
   */
  public async sendOtpEmail(options: SendEmailOtpOptions): Promise<EmailSendResult> {
    const { to, otp, userName } = options;

    if (!this.transporter || !this.isConfigured) {
      this.initTransporter();
    }

    const authUser = process.env.SMTP_USER || 'sikchakhub@gmail.com';
    const fromAddress = process.env.SMTP_FROM || `"SikchaKhub" <${authUser}>`;

    const plainTextMessage = `Your SikchakHub verification code is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`;

    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SikchakHub Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">SikchakHub.AI</h1>
              <p style="margin: 4px 0 0 0; color: #dbeafe; font-size: 13px;">AI-Powered Teacher & Faculty Recruitment Engine</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 600;">Account Verification</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello ${userName ? `<strong>${userName}</strong>` : 'Educator'},<br>
                Thank you for signing up with SikchakHub. Use the one-time verification code below to verify your email address:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #1d4ed8; display: inline-block;">
                  ${otp}
                </span>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">
                  ⏳ Valid for <strong>5 minutes</strong> • Single use only
                </p>
              </div>

              <!-- Mandatory Text -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #92400e;">
                  <strong>Important Security Note:</strong><br>
                  Your SikchakHub verification code is <strong>${otp}</strong>. It is valid for 5 minutes. Do not share this code with anyone. SikchakHub staff will never ask for your verification code.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not initiate this registration request on SikchakHub.AI, you can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} SikchakHub.AI • Helpline: +91 9783143866 • support@sikchakhub.ai
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

    // 1. If SMTP is configured, attempt real delivery
    if (this.transporter && this.isConfigured) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to,
          subject: `Your SikchakHub Verification Code: ${otp}`,
          text: plainTextMessage,
          html: htmlMessage,
        });

        return {
          success: true,
          messageId: info.messageId,
        };
      } catch (sendErr: any) {
        console.error('SMTP send error:', sendErr.message);
        // Fall back to recorded status
        return {
          success: false,
          error: `SMTP delivery failed: ${sendErr.message}`,
        };
      }
    }

    // 2. Safe development fallback when SMTP credentials are not yet configured
    console.info(`[EmailService] Dev Fallback: Email OTP challenge dispatched for ${to.replace(/(?<=.{2}).(?=.*@)/g, '*')}`);
    return {
      success: true,
      messageId: `dev-sim-${Date.now()}`,
    };
  }
}

export const emailService = new EmailService();
