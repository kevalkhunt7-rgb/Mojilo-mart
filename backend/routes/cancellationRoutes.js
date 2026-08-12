import express from 'express';
import {
  requestCancellation,
  getAllCancellationRequests,
  approveCancellation,
  rejectCancellation,
  getUserCancellationRequests
} from '../controllers/cancellationController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';

const router = express.Router();

router.use(protect);

// Customer endpoints
router.post('/request', requestCancellation);
router.get('/my', getUserCancellationRequests);

// Admin endpoints
router.get('/', adminOnly, getAllCancellationRequests);
router.patch('/:id/approve', adminOnly, approveCancellation);
router.patch('/:id/reject', adminOnly, rejectCancellation);

export default router;
