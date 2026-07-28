import express from 'express';
import { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { couponRules } from '../validators/couponValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.post('/', protect, adminOnly, couponRules, validate, createCoupon);

// Admin-only CRUD operations
router.get('/', protect, adminOnly, getCoupons);
router.patch('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
