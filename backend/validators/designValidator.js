import { body } from 'express-validator';

export const saveDesignRules = [
  body('name').notEmpty().withMessage('Design name is required').trim(),
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('customizations').isArray({ min: 1 }).withMessage('Customizations array must contain at least one layout'),
  body('customizations.*.printAreaId').isMongoId().withMessage('Each customization must map to a print area ID'),
  body('customizations.*.backgroundColor').optional().isHexColor().withMessage('Background color must be a valid hex color')
];
