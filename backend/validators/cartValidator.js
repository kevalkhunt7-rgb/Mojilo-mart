import { body } from 'express-validator';

export const addToCartRules = [
  body('productId').optional({ nullable: true }).isMongoId().withMessage('Invalid product ID'),
  body('variantId').optional({ nullable: true }).isString().withMessage('Invalid product variant ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customizationId').optional({ nullable: true }).isMongoId().withMessage('Invalid customization ID'),
  body('color').optional({ nullable: true }).isString().withMessage('Color selection must be a string'),
  body('size').optional({ nullable: true }).isString().withMessage('Size selection must be a string'),
  body('customizationData').optional({ nullable: true }).isObject().withMessage('Customization data must be an object')
];

export const updateQtyRules = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('color').optional().isString().withMessage('Color selection must be a string'),
  body('size').optional().isString().withMessage('Size selection must be a string')
];
