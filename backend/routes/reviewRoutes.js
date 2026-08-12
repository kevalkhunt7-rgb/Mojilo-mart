import express from 'express';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { upload } from '../middlewares/upload.js';
import {
  createReview,
  checkEligibility,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  adminListReviews,
  adminModerateReview,
  adminDeleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Public route: list reviews for a product
router.get('/product/:productId', getProductReviews);

// Authenticated customer routes
router.get('/check-eligibility', protect, checkEligibility);
router.post('/', protect, upload.array('images', 3), createReview);
router.get('/my', protect, getMyReviews);
router.patch('/:id', protect, upload.array('images', 3), updateReview);
router.delete('/:id', protect, deleteReview);

// Admin moderation routes
router.get('/admin', protect, adminOnly, adminListReviews);
router.get('/admin/list', protect, adminOnly, adminListReviews);
router.patch('/admin/:id/status', protect, adminOnly, adminModerateReview);
router.delete('/admin/:id', protect, adminOnly, adminDeleteReview);

export default router;
