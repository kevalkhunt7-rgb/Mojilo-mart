import { body } from 'express-validator';

export const updateSettingsRules = [
  body('storeName').optional().notEmpty().withMessage('Store name cannot be empty').trim(),
  body('currency').optional().isLength({ min: 1, max: 4 }).withMessage('Currency must be 1-4 letters'),
  body('taxRatePercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100%'),
  body('freeShippingThreshold').optional().isFloat({ min: 0 }).withMessage('Free shipping threshold must be positive'),
  body('minimumPrintCharge').optional().isFloat({ min: 0 }).withMessage('Minimum print charge must be a positive number'),
  body('pricePerSquareInch').optional().isFloat({ min: 0 }).withMessage('Price per square inch must be a positive number'),
  body('socialLinks').optional().isObject().withMessage('Social links must be an object'),
  body('seoMetadata').optional().isObject().withMessage('SEO metadata must be an object'),
  body('smtpSettings').optional().isObject().withMessage('SMTP settings must be an object')
];
