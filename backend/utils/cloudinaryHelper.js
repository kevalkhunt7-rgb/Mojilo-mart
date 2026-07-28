import { cloudinary } from '../config/cloudinary.js';
import logger from './logger.js';

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer 
 * @param {String} folder - Cloudinary folder name
 * @param {Object} options - Custom Cloudinary options
 * @returns {Promise<Object>}
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'mojilo', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, ...options },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary buffer upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Uploads a local file path to Cloudinary
 * @param {String} filePath 
 * @param {String} folder 
 * @param {Object} options - Custom Cloudinary options
 * @returns {Promise<Object>}
 */
export const uploadFileToCloudinary = async (filePath, folder = 'mojilo', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder, ...options });
    return result;
  } catch (error) {
    logger.error('Cloudinary file upload error:', error);
    throw error;
  }
};

/**
 * Transforms a Cloudinary secure_url to include background removal.
 * Inserts the `e_background_removal` and `f_png` transformations into
 * the URL so the background is stripped on-the-fly at delivery time.
 * @param {String} secureUrl - The original Cloudinary secure_url
 * @returns {String} - The transformed URL with bg removal
 */
export const applyBackgroundRemoval = (secureUrl) => {
  // Cloudinary URLs follow the pattern:
  // https://res.cloudinary.com/<cloud>/image/upload/<optional-transforms>/v<version>/<path>
  // We inject our transform right after "/upload/"
  const marker = '/upload/';
  const idx = secureUrl.indexOf(marker);
  if (idx === -1) return secureUrl; // not a standard Cloudinary URL, return as-is
  const before = secureUrl.slice(0, idx + marker.length);
  const after = secureUrl.slice(idx + marker.length);
  return `${before}e_background_removal/f_png/${after}`;
};

/**
 * Deletes a file from Cloudinary by its public ID
 * @param {String} publicId 
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary deletion error:', error);
    throw error;
  }
};
