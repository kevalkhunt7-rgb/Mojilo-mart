import { body, query } from 'express-validator';

export const createProductRules = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('description').notEmpty().withMessage('Description is required'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
  body('category').isMongoId().withMessage('Please select a valid category ID'),
  body('brand').optional({ checkFalsy: true }).isMongoId().withMessage('Please select a valid brand ID')
];

export const searchRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number')
];
