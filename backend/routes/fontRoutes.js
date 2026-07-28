import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getFonts, createFont, updateFont, deleteFont } from '../controllers/fontController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';

const router = express.Router();

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_access_secret_key');
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (err) {}
  next();
};

router.get('/', optionalProtect, getFonts);
router.post('/', protect, adminOnly, createFont);
router.patch('/:id', protect, adminOnly, updateFont);
router.delete('/:id', protect, adminOnly, deleteFont);

export default router;
