import express from 'express';
import { 
  getLayouts, 
  getLayoutByType, 
  createLayout,
  updateLayoutByType
} from '../controllers/layoutController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getLayouts);
router.get('/:type', getLayoutByType);
router.post('/', protect, adminOnly, createLayout);
router.put('/:type', protect, adminOnly, upload.any(), updateLayoutByType);

export default router;