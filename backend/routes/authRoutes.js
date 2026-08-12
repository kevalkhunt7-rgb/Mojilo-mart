import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin
} from '../controllers/authController.js';
import {
  registerRules,
  loginRules,
  emailVerificationRules,
  forgotPasswordRules,
  resetPasswordRules
} from '../validators/authValidator.js';
import { validate } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/google', googleLogin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/verify-email', emailVerificationRules, validate, verifyEmail);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);

export default router;
