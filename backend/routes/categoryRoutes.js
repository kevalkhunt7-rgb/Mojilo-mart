import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { categoryRules } from '../validators/categoryValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

/**
 * Optional authentication
 * Never blocks public requests.
 * If authentication fails for any reason, it simply continues.
 */
const optionalProtect = async (req, res, next) => {
  try {
    let token;

    // Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // No token -> public request
    if (!token) {
      return next();
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'jwt_access_secret_key'
      );
    } catch (err) {
      console.warn('Invalid JWT in optionalProtect:', err.message);
      return next();
    }

    try {
      const user = await User.findById(decoded.id)
        .select('-password')
        .lean();

      if (user) {
        req.user = user;
      }
    } catch (err) {
      console.error('User lookup failed:', err.message);
      // Continue anyway
    }

    return next();
  } catch (err) {
    console.error('optionalProtect error:', err);
    return next();
  }
};

/* ---------------------- PUBLIC ROUTES ---------------------- */

router.get('/', getCategories);
// If you actually need req.user on this endpoint, use:
// router.get('/', optionalProtect, getCategories);

/* ---------------------- ADMIN ROUTES ---------------------- */

router.post(
  '/',
  protect,
  adminOnly,
  categoryRules,
  validate,
  createCategory
);

router.patch(
  '/:id',
  protect,
  adminOnly,
  categoryRules,
  validate,
  updateCategory
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteCategory
);

export default router;