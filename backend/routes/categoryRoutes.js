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

// Optional authentication middleware
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'jwt_access_secret_key'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid token
  }

  next();
};

// Public Route
router.get('/', optionalProtect, getCategories);

// Admin Routes
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