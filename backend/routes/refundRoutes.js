import express from 'express';
import { refundPayment, getRefunds, updateRefundStatus } from '../controllers/refundController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';

const router = express.Router();

// Admin-only refund triggers and logs
router.post('/', protect, adminOnly, refundPayment);
router.get('/', protect, adminOnly, getRefunds);
router.patch('/:id', protect, adminOnly, updateRefundStatus);

export default router;
