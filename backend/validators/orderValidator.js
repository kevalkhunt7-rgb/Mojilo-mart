import { body } from 'express-validator';

export const placeOrderRules = [
  body('paymentMethod').optional().isIn(['Online', 'online']).withMessage('Payment method must be Online'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.name').notEmpty().withMessage('Shipping name is required').trim(),
  body('shippingAddress.street').notEmpty().withMessage('Shipping street is required').trim(),
  body('shippingAddress.city').notEmpty().withMessage('Shipping city is required').trim(),
  body('shippingAddress.state').notEmpty().withMessage('Shipping state is required').trim(),
  body('shippingAddress.zipCode').notEmpty().withMessage('Shipping ZIP code is required').trim(),
  body('shippingAddress.phone').notEmpty().withMessage('Shipping phone is required').matches(/^[0-9+\s-]{10,15}$/).withMessage('Please enter a valid 10-digit phone number').trim(),
  body('billingAddress').isObject().withMessage('Billing address is required'),
  body('billingAddress.name').notEmpty().withMessage('Billing name is required').trim(),
  body('billingAddress.street').notEmpty().withMessage('Billing street is required').trim(),
  body('billingAddress.city').notEmpty().withMessage('Billing city is required').trim(),
  body('billingAddress.state').notEmpty().withMessage('Billing state is required').trim(),
  body('billingAddress.zipCode').notEmpty().withMessage('Billing ZIP code is required').trim(),
  body('billingAddress.phone').notEmpty().withMessage('Billing phone is required').matches(/^[0-9+\s-]{10,15}$/).withMessage('Please enter a valid 10-digit phone number').trim(),
  body('shippingMethodId').optional().isMongoId().withMessage('Invalid shipping method ID'),
  body('couponCode').optional().trim()
];
