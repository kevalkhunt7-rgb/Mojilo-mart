import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  mergeCart 
} from '../controllers/cartController.js';
import { protect } from '../middlewares/auth.js';
import { addToCartRules, updateQtyRules } from '../validators/cartValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

// Optional auth: can read/write for guest or logged in user
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.accessToken)) {
    return protect(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, addToCartRules, validate, addToCart);
router.patch('/:itemId', optionalAuth, updateQtyRules, validate, updateCartItem);
router.delete('/:itemId', optionalAuth, removeCartItem);

// Requires auth to merge guest cart to user account
router.post('/merge', protect, mergeCart);

export default router;