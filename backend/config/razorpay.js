import Razorpay from 'razorpay';
import logger from '../utils/logger.js';

let razorpayInstance = null;
let currentKeyId = null;

export const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : null;
  const keySecret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : null;

  if (!keyId || !keySecret || keyId === 'undefined' || keySecret === 'undefined') {
    logger.warn('Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing or empty. Running in Mock mode.');
    return {
      isMock: true,
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
        capture: async (paymentId, amount) => {
          logger.info(`[Razorpay Mock] Capturing payment ${paymentId} for amount ${amount}`);
          return { status: 'captured', id: paymentId, amount };
        },
        refund: async (paymentId, options) => {
          logger.info(`[Razorpay Mock] Refunding payment ${paymentId}:`, options);
          return { status: 'refunded', id: `rfnd_mock_${Math.random().toString(36).substr(2, 9)}` };
        }
      }
    };
  }

  if (!razorpayInstance || currentKeyId !== keyId) {
    try {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      currentKeyId = keyId;
      logger.info(`Razorpay SDK initialized in ${keyId.startsWith('rzp_live') ? 'LIVE' : 'TEST'} mode.`);
    } catch (error) {
      logger.error('Failed to initialize Razorpay SDK:', error);
      throw error;
    }
  }

  return razorpayInstance;
};

const proxy = new Proxy({}, {
  get(target, prop) {
    const instance = getRazorpayInstance();
    return instance[prop];
  }
});

export default proxy;
