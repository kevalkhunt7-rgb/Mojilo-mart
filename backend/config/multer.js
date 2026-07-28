import multer from 'multer';
import path from 'path';

// Memory Storage (for direct Cloudinary upload)
export const memoryStorage = multer.memoryStorage();

// Disk Storage (for local temporary files if needed)
export const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 10MB default upload size limit
export const uploadLimits = {
  fileSize: 10 * 1024 * 1024,
};

// Check image types
export const imageFileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|svg|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPEG, JPG, PNG, SVG, WEBP) are allowed!'));
};
