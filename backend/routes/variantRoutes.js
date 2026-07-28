import express from 'express';
import { 
  getProductVariants, 
  createProductVariant,
  getAllVariants,
  updateProductVariant,
  deleteProductVariant,
  getAttributes,
  getVariantById,
  createAttributeValue,
  deleteAttributeValue
} from '../controllers/variantController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';

const router = express.Router();

// Admin-only attributes list
router.get('/attributes', protect, adminOnly, getAttributes);
router.post('/attributes/values', protect, adminOnly, createAttributeValue);
router.delete('/attributes/values/:id', protect, adminOnly, deleteAttributeValue);

router.get('/product/:productId', getProductVariants);

// Admin-only variant actions
router.get('/', protect, adminOnly, getAllVariants);
router.get('/id/:id', protect, adminOnly, getVariantById);
router.post('/', protect, adminOnly, createProductVariant);
router.patch('/:id', protect, adminOnly, updateProductVariant);
router.delete('/:id', protect, adminOnly, deleteProductVariant);

export default router;
