import transporter from '../config/mail.js';
import logger from './logger.js';

/**
 * Sends an email using the global transporter configuration
 */
const sendEmail = async ({ email, subject, message, html }) => {
  try {
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@yourverifieddomain.com';
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Mojilo'} <${fromEmail}>`,
      to: email,
      subject: subject,
      text: message,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email successfully sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${email}:`, error);
    throw error;
  }
};

export default sendEmail;
