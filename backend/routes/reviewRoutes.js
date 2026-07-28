import express from 'express';
import { 
  addProductReview, 
  getProductReviews,
  getAllReviews,
  toggleReviewStatus,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { reviewRules } from '../validators/reviewValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', protect, reviewRules, validate, addProductReview);

// Admin-only review moderation
router.get('/', protect, adminOnly, getAllReviews);
router.patch('/:id/status', protect, adminOnly, toggleReviewStatus);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
