import transporter from '../config/mail.js';
import logger from './logger.js';

/**
 * Sends an email using the global transporter configuration
 */
const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@yourverifieddomain.com';
    const fromName = process.env.FROM_NAME || 'Mojilo';

    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: subject,
      text: message,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email successfully sent to ${email} (From: ${fromEmail}): ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${email}:`, error);
    throw error;
  }
};

export default sendEmail;
