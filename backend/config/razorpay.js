import Razorpay from 'razorpay';
import logger from '../utils/logger.js';

let razorpayInstance = null;

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  logger.warn('Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing. Payment integrations will run in Mock mode.');
  // Create a mock instance so services calling it won't crash instantly
  razorpayInstance = {
    orders: {
      create: async (options) => {
        logger.info('[Razorpay Mock] Creating mock order:', options);
        return {
          id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          notes: options.notes,
          created_at: Math.floor(Date.now() / 1000)
        };
      }
    },
    payments: {
      capture: async (paymentId, amount, currency) => {
        logger.info(`[Razorpay Mock] Capturing payment ${paymentId} for amount ${amount}`);
        return { status: 'captured', id: paymentId, amount };
      },
      refund: async (paymentId, options) => {
        logger.info(`[Razorpay Mock] Refunding payment ${paymentId}:`, options);
        return { status: 'refunded', id: `rfnd_mock_${Math.random().toString(36).substr(2, 9)}` };
      }
    }
  };
} else {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    logger.info('Razorpay initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize Razorpay SDK:', error);
  }
}

export default razorpayInstance;
