import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTags,
  getCollections
} from '../controllers/productController.js';
import { protect } from '../middlewares/auth.js';
import { adminOnly } from '../middlewares/admin.js';
import { upload } from '../middlewares/upload.js';
import { createProductRules, searchRules } from '../validators/productValidator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

// --- Public Endpoints ---
router.get('/', searchRules, validate, getProducts);
router.get('/tags', getTags);
router.get('/collections', getCollections);
router.get('/id/:id', getProductById);
router.get('/:slug', getProductBySlug);

// --- Admin-Only Endpoints ---
router.post(
  '/',
  protect,
  adminOnly,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'sizeChart', maxCount: 1 }
  ]),
  // Inline mapping middleware kept for safety so validation passes 
  // whether frontend sends 'price' or 'basePrice'
  (req, res, next) => {
    if (req.body.price && !req.body.basePrice) {
      req.body.basePrice = req.body.price;
    }
    next();
  },
  createProductRules,
  validate,
  createProduct
);

router.patch(
  '/:id',
  protect,
  adminOnly,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'sizeChart', maxCount: 1 }
  ]),
  updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;