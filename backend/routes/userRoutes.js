import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getOrderHistory, 
  getSavedDesigns,
  getAllUsers,
  toggleUserStatus,
  updateUserRole
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { updateProfileRules } from '../validators/userValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

router.use(protect); // All user routes require authentication

router.get('/profile', getProfile);
router.patch('/profile', updateProfileRules, validate, updateProfile);
router.get('/orders', getOrderHistory);
router.get('/saved-designs', getSavedDesigns);

// Admin-only user management routes
router.get('/', adminOnly, getAllUsers);
router.patch('/:id/status', adminOnly, toggleUserStatus);
router.patch('/:id/role', adminOnly, updateUserRole);

export default router;