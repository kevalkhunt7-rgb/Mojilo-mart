import logger from './logger.js';

/**
 * Sends an SMS to a phone number.
 * For production, integrate with a provider like Twilio, Msg91, or Plivo.
 */
const sendSMS = async ({ phone, message }) => {
  try {
    logger.info(`[SMS MOCK] Sending SMS to ${phone}: ${message}`);
    // Simulate SMS gateway response
    return {
      success: true,
      messageId: `sms_mock_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    logger.error(`Error sending SMS to ${phone}:`, error);
    throw error;
  }
};

export default sendSMS;
