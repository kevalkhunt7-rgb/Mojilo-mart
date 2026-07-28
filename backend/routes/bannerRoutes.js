import express from 'express';
import { 
  createBanner, 
  getAllBanners, 
  getActiveBanners, 
  updateBanner, 
  deleteBanner 
} from '../controllers/bannerController.js';
// Import your application's file storage middleware (e.g., Multer)
import { upload } from '../middlewares/upload.js'; 
// Import your authentication/authorization checking middlewares if needed
// import { verifyJWT, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ------------------------------------------------------------------------
// PUBLIC ENDPOINTS
// ------------------------------------------------------------------------
// Used by the main frontend landing homepage hero slider component to display active slides
router.get('/active', getActiveBanners);


// ------------------------------------------------------------------------
// ADMIN PROTECTED ENDPOINTS 
// (Add your auth middlewares here like: router.use(verifyJWT, isAdmin);)
// ------------------------------------------------------------------------

// Fetch all banners for listing down inside your Admin Dashboard panel list table
router.get('/', getAllBanners);

// Create a new slide instance ('image' matches data.append('image', imageFile) on frontend)
router.post('/', upload.single('image'), createBanner);

// Update/Edit an existing slider record text data metadata or replace its display graphic
router.patch('/:id', upload.single('image'), updateBanner);

// Delete an unwanted slider record entirely from your database and asset managers
router.delete('/:id', deleteBanner);

export default router;