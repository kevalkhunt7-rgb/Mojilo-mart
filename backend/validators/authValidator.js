import { body } from 'express-validator';

export const registerRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter (A-Z)')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter (a-z)')
    .matches(/[0-9]/).withMessage('Password must contain at least one numeric digit (0-9)')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/).withMessage('Password must contain at least one special character (!@#$%^&*)'),
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
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter (A-Z)')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter (a-z)')
    .matches(/[0-9]/).withMessage('Password must contain at least one numeric digit (0-9)')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/).withMessage('Password must contain at least one special character (!@#$%^&*)')
];

