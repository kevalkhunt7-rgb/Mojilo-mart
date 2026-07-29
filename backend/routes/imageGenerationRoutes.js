import express from 'express';
import { generateImage } from '../controllers/imageGenerationController.js';

const router = express.Router();

/**
 * POST /api/generate-image
 * Public route — no auth required (add `protect` middleware if you want to gate it to logged-in users)
 */
router.post('/', generateImage);

export default router;
