import { body } from 'express-validator';

export const registerRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
 
];

export const loginRules = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export const emailVerificationRules = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
];

export const forgotPasswordRules = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail()
];

export const resetPasswordRules = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];
