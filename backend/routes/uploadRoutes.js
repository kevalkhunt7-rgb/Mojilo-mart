    import express from 'express';
    import { uploadDesignImage, getMyUploads, deleteMyUpload, proxyImage } from '../controllers/uploadController.js';
    import { upload } from '../middlewares/upload.js';
    import { protect, optionalProtect } from '../middlewares/auth.js';

    const router = express.Router();

    // Allowed for guest sessions too (custom design creation before signup)
    router.post('/image', optionalProtect, upload.single('image'), uploadDesignImage);
    router.get('/my-uploads', protect, getMyUploads);
    router.get('/proxy', proxyImage); // Open endpoint for CORS image proxying
    router.delete('/:id', protect, deleteMyUpload);

    export default router;
