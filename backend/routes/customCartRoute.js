import express from 'express';
import {
  getCustomCart,
  addCustomItem,
  updateCustomItem,
  removeCustomItem
} from '../controllers/customCartController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Optional auth for guest sessions or registered users
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.accessToken)) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getCustomCart);
router.post('/', optionalAuth, addCustomItem);
router.patch('/:itemId', optionalAuth, updateCustomItem);
router.delete('/:itemId', optionalAuth, removeCustomItem);

export default router;
