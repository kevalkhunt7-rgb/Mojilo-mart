import express from 'express';
import { refundPayment, getRefunds, updateRefundStatus, syncRefundStatus, handleWebhook } from '../controllers/refundController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';

const router = express.Router();

// Webhook endpoint (Public for gateway callbacks)
router.post('/webhook', handleWebhook);

// Admin-only refund triggers and logs
router.post('/', protect, adminOnly, refundPayment);
router.get('/', protect, adminOnly, getRefunds);
router.post('/:id/sync', protect, adminOnly, syncRefundStatus);
router.patch('/:id', protect, adminOnly, updateRefundStatus);

export default router;
