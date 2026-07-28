import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

const isProduction = process.env.NODE_ENV === 'production';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 10000, // Scale limits up in development to prevent blocks during reloads
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP. Please try again after 15 minutes.'));
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProduction ? 15 : 1000, // Scale authentication limits in development
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login attempts. Please try again after an hour.'));
  },
});
