import { body } from 'express-validator';

export const wishlistRules = [
  body('productId').isMongoId().withMessage('Please supply a valid product ID')
];
