import { body } from 'express-validator';

export const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').notEmpty().withMessage('Review comment is required').trim(),
  body('title').optional().trim(),
  body('images').optional().isArray().withMessage('Images must be supplied as an array of URLs')
];
