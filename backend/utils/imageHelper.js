/**
 * Generates Cloudinary transformation URL for optimized T-shirt mockup overlay
 * @param {String} publicId - Cloudinary public id of the uploaded print layer
 * @param {Object} options - Width, height, crop, quality
 * @returns {String}
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!publicId) return '';
  const { width = 500, height = 500, crop = 'limit', quality = 'auto' } = options;
  
  // Format: https://res.cloudinary.com/<cloud_name>/image/upload/w_500,h_500,c_limit,q_auto/v1/...
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'mojilo';
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
};

/**
 * Validates file extension for design uploads
 * @param {String} fileName 
 * @param {Array} allowedTypes 
 * @returns {Boolean}
 */
export const isAllowedImageType = (fileName, allowedTypes = ['jpg', 'jpeg', 'png', 'svg']) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
};
