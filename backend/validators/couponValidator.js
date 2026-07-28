import { body } from 'express-validator';

export const couponRules = [
  body('code').notEmpty().withMessage('Coupon code is required').trim().toUpperCase(),
  body('type').isIn(['percentage', 'flat']).withMessage('Coupon type must be either percentage or flat'),
  body('value').isFloat({ min: 0 }).withMessage('Coupon value must be a positive number'),
  body('expiresAt').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate().withMessage('Please supply a valid expiration date'),
  body('usageLimit').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Usage limit must be a positive integer or 0 for unlimited'),
  body('minOrderAmount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
  body('maxDiscountAmount').optional().isFloat({ min: 0 }).withMessage('Maximum discount amount must be positive')
];
