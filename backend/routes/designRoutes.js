import express from 'express';
import {
  getPrintAreas,
  createPrintArea,
  saveDesign,
  getDesign,
  updateDesign,
  getAllDesigns,
  deleteDesign
} from '../controllers/designController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { saveDesignRules } from '../validators/designValidator.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

const parseDesignFormData = (req, res, next) => {
  if (req.body.customizations && typeof req.body.customizations === 'string') {
    try {
      req.body.customizations = JSON.parse(req.body.customizations);
    } catch (err) {
      // Allow validators to fail cleanly
    }
  }
  if (req.body.previewImage && typeof req.body.previewImage === 'string') {
    try {
      req.body.previewImage = JSON.parse(req.body.previewImage);
    } catch (err) { }
  }
  next();
};

router.get('/print-areas/:productId', getPrintAreas);
router.post('/print-areas', protect, adminOnly, createPrintArea);

router.post('/save', protect, upload.single('image'), parseDesignFormData, saveDesignRules, validate, saveDesign);
router.get('/public', getAllDesigns);
router.get('/', protect, adminOnly, getAllDesigns);
router.get('/:id', getDesign);
router.patch('/:id', protect, upload.single('image'), parseDesignFormData, saveDesignRules, validate, updateDesign);
router.delete('/:id', protect, adminOnly, deleteDesign);

export default router;