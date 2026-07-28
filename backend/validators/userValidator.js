import { body } from 'express-validator';

export const updateProfileRules = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('phoneNumber').optional().isMobilePhone().withMessage('Please enter a valid phone number')
];

export const addressRules = [
  body('name').notEmpty().withMessage('Contact name is required').trim(),
  body('street').notEmpty().withMessage('Street detail is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('state').notEmpty().withMessage('State is required').trim(),
  body('zipCode').notEmpty().withMessage('ZIP/Postal code is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('addressType').optional().isIn(['shipping', 'billing', 'both']).withMessage('Invalid address type'),
  body('isDefaultShipping').optional().isBoolean().withMessage('Must be a boolean'),
  body('isDefaultBilling').optional().isBoolean().withMessage('Must be a boolean')
];
