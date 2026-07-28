import transporter from '../config/mail.js';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    // Standard default string parameters to prevent the "undefined" bug
    this.fromName = process.env.FROM_NAME || 'Mojilo';
    this.fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@yourverifieddomain.com'; // 👈 Swap with your fallback domain
  }

  async sendVerificationEmail(email, name, otp) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee;">
        <h2 style="color: #333333; text-align: center;">Welcome to Mojilo, ${name}!</h2>
        <p>Thank you for registering. Please verify your email address by using the OTP code below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; background-color: #f7f7f7; padding: 10px 20px; border: 1px dashed #cccccc; letter-spacing: 2px;">${otp}</span>
        </div>
        <p>This code is valid for 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777777;">If you did not request this email, please ignore it.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: 'Verify your Mojilo Account',
        html: htmlContent
      });
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending verification email to ${email}:`, error);
    }
  }

  async sendPasswordResetEmail(email, otp) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee;">
        <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
        <p>We received a request to reset your password. Use the following OTP code to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; background-color: #f7f7f7; padding: 10px 20px; border: 1px dashed #cccccc; letter-spacing: 2px;">${otp}</span>
        </div>
        <p>This code is valid for 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777777;">If you did not request a password reset, please secure your account immediately.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: 'Mojilo Password Reset Request',
        html: htmlContent
      });
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Error sending password reset email to ${email}:`, error);
    }
  }

  async sendOrderConfirmationEmail(email, order, pdfBuffer = null) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee;">
        <h2 style="color: #4caf50; text-align: center;">Order Confirmed!</h2>
        <p>Hi,</p>
        <p>Thank you for shopping with Mojilo. Your order <strong>#${order.orderNumber}</strong> has been successfully placed.</p>
        <p><strong>Total Amount Paid:</strong> Rs. ${order.totalAmount.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p>Your custom garment is heading to the printing queue. We will send you updates as the order status changes.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777777;">Attached you will find the PDF copy of your invoice.</p>
      </div>
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
        html: htmlContent,
        attachments
      });
      logger.info(`Order confirmation email sent to ${email} for order #${order.orderNumber}`);
    } catch (error) {
      logger.error(`Error sending order confirmation email to ${email}:`, error);
    }
  }
}

export default new EmailService();