import express from 'express';
import {
  placeOrder,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { placeOrderRules } from '../validators/orderValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.use(protect);

router.post('/', placeOrderRules, validate, placeOrder);
router.get('/', adminOnly, getAllOrders);
router.get('/:id', getOrderDetails);

// Status update (Admin/Moderator only)
router.patch('/:id/status', adminOnly, updateOrderStatus);

export default router;
