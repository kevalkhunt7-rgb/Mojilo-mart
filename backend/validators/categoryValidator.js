import { body } from 'express-validator';

export const categoryRules = [
  body('name').notEmpty().withMessage('Category name is required').trim(),
  body('parentCategory')
    .optional({ checkFalsy: true }) // Treats empty string "" as optional
    .isMongoId()
    .withMessage('Parent category must be a valid Mongo ID')
];