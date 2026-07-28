import { body } from 'express-validator';

export const verifySignatureRules = [
  body('orderId').isMongoId().withMessage('Invalid order ID reference'),
  body('razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required').trim(),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required').trim(),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature hash is required').trim()
];
