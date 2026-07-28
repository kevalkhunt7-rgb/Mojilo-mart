import express from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from '../controllers/wishlistController.js';
import { protect } from '../middlewares/auth.js';
import { wishlistRules } from '../validators/wishlistValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/', wishlistRules, validate, addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;