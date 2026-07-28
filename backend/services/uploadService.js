import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';
import UploadedImage from '../models/UploadedImage.js';
import Asset from '../models/Asset.js';
import ApiError from '../utils/ApiError.js';

class UploadService {
  async uploadDesignImage(userId, file) {
    if (!file) {
      throw new ApiError(400, 'No file provided for upload');
    }

    // Validate MIME types
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, 'Invalid file type. Only PNG, JPG, JPEG, SVG, and WEBP are allowed');
    }

    // Validate file size (10MB max limit as default)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new ApiError(400, 'File size exceeds the maximum limit of 10MB');
    }

    try {
      const folderName = userId ? `user_${userId}/designs` : 'guest/designs';
      const result = await uploadBufferToCloudinary(file.buffer, folderName);

      // Create UploadedImage record for backward compatibility
      const uploadRecord = await UploadedImage.create({
        user: userId || null,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        fileSize: file.size,
        fileType: file.mimetype.split('/')[1]
      });

      // Create Asset record for the new customizer architecture
      const assetRecord = await Asset.create({
        userId: userId || null,
        originalFileName: file.originalname || 'uploaded_design',
        mimeType: file.mimetype,
        fileSize: file.size,
        cloudinaryPublicId: result.public_id,
        originalUrl: result.secure_url,
        thumbnailUrl: result.secure_url,
        bgRemovedFlag: false,
        width: result.width || 0,
        height: result.height || 0
      });

      return {
        id: assetRecord._id,
        uploadId: uploadRecord._id,
        url: assetRecord.originalUrl,
        publicId: assetRecord.cloudinaryPublicId
      };
    } catch (error) {
      throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
    }
  }

  async getMyAssets(userId) {
    if (!userId) {
      throw new ApiError(401, 'Authentication required to fetch assets');
    }
    return await Asset.find({ userId }).sort({ createdAt: -1 });
  }

  async deleteAsset(userId, assetId) {
    if (!userId) {
      throw new ApiError(401, 'Authentication required to delete asset');
    }

    const asset = await Asset.findOne({ _id: assetId, userId });
    if (!asset) {
      throw new ApiError(404, 'Asset not found or access denied');
    }

    try {
      if (asset.cloudinaryPublicId) {
        await deleteFromCloudinary(asset.cloudinaryPublicId);
      }
    } catch (err) {
      console.error('Failed to delete asset from Cloudinary:', err);
    }

    // Also delete the matching UploadedImage for backward compatibility
    await UploadedImage.deleteOne({ publicId: asset.cloudinaryPublicId });
    await asset.deleteOne();

    return { message: 'Asset deleted successfully' };
  }
}

export default new UploadService();
