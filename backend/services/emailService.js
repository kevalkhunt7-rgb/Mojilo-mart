import transporter from '../config/mail.js';
import logger from '../utils/logger.js';

class EmailService {
  get fromName() {
    return process.env.FROM_NAME || 'Mojilo';
  }

  get fromEmail() {
    return process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@yourverifieddomain.com';
  }

  // Shared wrapper so every email has consistent branding, spacing, and a footer.
  wrapTemplate({ preheader = '', bodyContent, }) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Mojilo</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <!-- Preheader (hidden preview text) -->
      <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
        ${preheader}
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

              <!-- Header -->
              <tr>
                <td style="background-color:#111827; padding:24px 32px; text-align:center;">
                  <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">MOJILO</span>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 32px;">
                  ${bodyContent}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#fafafa; padding:20px 32px; text-align:center; border-top:1px solid #eeeeee;">
                  <p style="margin:0; font-size:12px; color:#9ca3af; line-height:1.6;">
                    &copy; ${new Date().getFullYear()} Mojilo. All rights reserved.<br />
                    This is an automated message, please do not reply directly to this email.
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

  otpBlock(otp) {
    return `
      <div style="text-align:center; margin:32px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            ${otp
              .toString()
              .split('')
              .map(
                (digit) => `
                  <td style="padding: 0 4px;">
                    <div style="width:40px; height:48px; line-height:48px; background-color:#f3f4f6; border:1px solid #e5e7eb; border-radius:8px; font-size:22px; font-weight:700; color:#111827; text-align:center;">
                      ${digit}
                    </div>
                  </td>`
              )
              .join('')}
          </tr>
        </table>
      </div>
    `;
  }

  async sendVerificationEmail(email, name, otp) {
    const bodyContent = `
      <h2 style="margin:0 0 16px; font-size:20px; color:#111827;">Welcome to Mojilo, ${name}!</h2>
      <p style="margin:0 0 8px; font-size:15px; color:#4b5563; line-height:1.6;">
        Thanks for signing up. Please confirm your email address using the verification code below.
      </p>
      ${this.otpBlock(otp)}
      <p style="margin:0; font-size:13px; color:#9ca3af; text-align:center;">
        This code expires in 15 minutes.
      </p>
      <hr style="border:none; border-top:1px solid #eeeeee; margin:32px 0;" />
      <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.6;">
        If you didn't create a Mojilo account, you can safely ignore this email.
      </p>
    `;

    try {
      await transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: 'Verify your Mojilo Account',
        html: this.wrapTemplate({
          preheader: `Your verification code is ${otp}`,
          bodyContent
        })
      });
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending verification email to ${email}:`, error);
    }
  }

  async sendPasswordResetEmail(email, otp) {
    const bodyContent = `
      <h2 style="margin:0 0 16px; font-size:20px; color:#111827;">Reset your password</h2>
      <p style="margin:0 0 8px; font-size:15px; color:#4b5563; line-height:1.6;">
        We received a request to reset your Mojilo password. Use the code below to continue.
      </p>
      ${this.otpBlock(otp)}
      <p style="margin:0; font-size:13px; color:#9ca3af; text-align:center;">
        This code expires in 15 minutes.
      </p>
      <hr style="border:none; border-top:1px solid #eeeeee; margin:32px 0;" />
      <p style="margin:0; font-size:13px; color:#b91c1c; line-height:1.6;">
        If you didn't request a password reset, please secure your account immediately.
      </p>
    `;

    try {
      await transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: 'Mojilo Password Reset Request',
        html: this.wrapTemplate({
          preheader: `Your password reset code is ${otp}`,
          bodyContent
        })
      });
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending password reset email to ${email}:`, error);
    }
  }

  async sendOrderConfirmationEmail(email, order, pdfBuffer = null) {
    const bodyContent = `
      <div style="text-align:center; margin-bottom:24px;">
        <div style="display:inline-block; width:56px; height:56px; line-height:56px; background-color:#ecfdf5; border-radius:50%; font-size:28px;">
          ✓
        </div>
      </div>
      <h2 style="margin:0 0 8px; font-size:20px; color:#111827; text-align:center;">Order Confirmed</h2>
      <p style="margin:0 0 24px; font-size:15px; color:#4b5563; line-height:1.6; text-align:center;">
        Thank you for shopping with Mojilo. Your order has been placed successfully.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border-radius:8px; margin:0 0 24px;">
        <tr>
          <td style="padding:16px 20px; border-bottom:1px solid #eeeeee;">
            <span style="font-size:13px; color:#6b7280;">Order Number</span><br />
            <span style="font-size:15px; color:#111827; font-weight:600;">#${order.orderNumber}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px; border-bottom:1px solid #eeeeee;">
            <span style="font-size:13px; color:#6b7280;">Total Amount Paid</span><br />
            <span style="font-size:15px; color:#111827; font-weight:600;">Rs. ${order.totalAmount.toFixed(2)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;">
            <span style="font-size:13px; color:#6b7280;">Payment Method</span><br />
            <span style="font-size:15px; color:#111827; font-weight:600;">${order.paymentMethod}</span>
          </td>
        </tr>
      </table>

      <p style="margin:0; font-size:14px; color:#4b5563; line-height:1.6; text-align:center;">
        Your custom garment is heading to the printing queue. We'll email you as the status updates.
      </p>

      <hr style="border:none; border-top:1px solid #eeeeee; margin:32px 0;" />
      <p style="margin:0; font-size:13px; color:#9ca3af; text-align:center;">
        A PDF copy of your invoice is attached to this email.
      </p>
    `;

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `invoice-${order.orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    try {
      await transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html: this.wrapTemplate({
          preheader: `Your order #${order.orderNumber} is confirmed`,
          bodyContent
        }),
        attachments
      });
      logger.info(`Order confirmation email sent to ${email} for order #${order.orderNumber}`);
    } catch (error) {
      logger.error(`Error sending order confirmation email to ${email}:`, error);
    }
  }
}

export default new EmailService();
