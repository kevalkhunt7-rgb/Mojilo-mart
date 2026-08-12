import express from 'express';
import {
  placeOrder,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
  cancelUnpaidOrder
} from '../controllers/orderController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { placeOrderRules } from '../validators/orderValidator.js';
import { validate } from '../middlewares/validate.js';

import { requestCancellation } from '../controllers/cancellationController.js';

const router = express.Router();

router.use(protect);

router.post('/', placeOrderRules, validate, placeOrder);
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrderDetails);

// Cancel Unpaid Order (Customer - on Razorpay dismiss/failure)
router.post('/:id/cancel-unpaid', cancelUnpaidOrder);

// Cancellation Request (Customer)
router.post('/:id/cancel-request', requestCancellation);

// Status update (Admin/Moderator only)
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;
