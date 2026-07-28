import express from 'express';
import { 
  createPaymentOrder, 
  verifyPaymentSignature,
  getPayments
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { verifySignatureRules } from '../validators/paymentValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify-signature', verifySignatureRules, validate, verifyPaymentSignature);

// Admin-only transaction logs
router.get('/', adminOnly, getPayments);

export default router;
