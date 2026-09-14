import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded from all possible directories (root or child)
function loadEnvironment() {
  try {
    const cwd = process.cwd();
    dotenv.config();
    dotenv.config({ path: path.resolve(cwd, '.env'), override: true });
    dotenv.config({ path: path.resolve(cwd, '../.env'), override: true });
    dotenv.config({ path: path.resolve(cwd, 'kabadconnect-web/.env'), override: true });
  } catch {}
}

loadEnvironment();

/**
 * Returns configured nodemailer transporter or null if SMTP not set
 */
function getTransporter() {
  if (!process.env.GMAIL_USER && !process.env.SMTP_HOST) {
    loadEnvironment();
  }

  const rawGmailUser = process.env.GMAIL_USER;
  const rawGmailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;

  if (rawGmailUser && rawGmailPass) {
    const gmailUser = rawGmailUser.trim();
    // Google App Passwords are 16 characters, often with spaces like 'dyci xkqh jknl zwwq'
    const gmailPass = rawGmailPass.replace(/\s+/g, '');

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Send OTP to user's email address
 */
export async function sendOtpEmail({ to, otp, purpose = 'login' }) {
  const actionText = purpose === 'register' ? 'Account Registration' : 'Account Sign In';
  const transporter = getTransporter();

  // If SMTP is not yet configured, return error
  if (!transporter) {
    console.warn(`[EmailService] SMTP transporter not configured for ${to}`);
    return {
      success: false,
      delivered: false,
      error: 'Email service is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in environment.'
    };
  }

  const senderEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'no-reply@kabadconnect.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KabadConnect OTP</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #072e1c 0%, #0D5C3A 100%); padding: 30px 24px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                    ♻️ KabadConnect
                  </h1>
                  <p style="margin: 6px 0 0 0; color: #34D399; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Hyperlocal Recycling Marketplace
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px;">
                  <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 19px; font-weight: 700;">
                    ${actionText} Verification Code
                  </h2>
                  <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.5;">
                    Please use the following 6-digit One-Time Password (OTP) to verify your email address (<strong>${to}</strong>):
                  </p>

                  <!-- OTP Box -->
                  <div style="background: #ecfdf5; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #065f46; font-family: monospace;">
                      ${otp}
                    </span>
                    <div style="margin-top: 8px; font-size: 12px; color: #047857; font-weight: 600;">
                      ⏱️ Valid for 10 minutes only
                    </div>
                  </div>

                  <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                    If you did not request this verification code, please ignore this email. No action is required.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                    © ${new Date().getFullYear()} KabadConnect. Transparent Doorstep Scrap Collection.
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

  try {
    const info = await transporter.sendMail({
      from: `"KabadConnect Security" <${senderEmail}>`,
      to,
      subject: `${otp} is your KabadConnect ${actionText} code`,
      text: `Your KabadConnect verification code is: ${otp}. It is valid for 10 minutes.`,
      html: htmlContent
    });

    console.log(`[EmailService] OTP email sent successfully to ${to}: ${info.messageId}`);
    return {
      success: true,
      delivered: true,
      message: `OTP sent to ${to}`
    };
  } catch (err) {
    console.error('[EmailService Error]:', err.message);
    return {
      success: false,
      delivered: false,
      error: `Failed to deliver email: ${err.message}`
    };
  }
}
