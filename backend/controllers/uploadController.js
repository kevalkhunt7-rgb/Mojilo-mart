import uploadService from '../services/uploadService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import UploadedImage from '../models/UploadedImage.js';
import Asset from '../models/Asset.js';
import ApiError from '../utils/ApiError.js';

export const uploadDesignImage = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadDesignImage(req.user ? req.user._id : null, req.file);
  res.status(200).json(new ApiResponse(200, result, 'Image uploaded successfully'));
});

export const getMyUploads = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  if (!userId) {
    throw new ApiError(401, 'Authentication required to fetch uploads');
  }
  // Query new Asset collection for assets
  const assets = await Asset.find({ userId }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, assets, 'User design assets retrieved successfully'));
});

export const deleteMyUpload = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const { id } = req.params;
  
  if (!userId) {
    throw new ApiError(401, 'Authentication required to delete upload');
  }

  // Try finding in Asset first
  const asset = await Asset.findOne({ _id: id, userId });
  if (asset) {
    const result = await uploadService.deleteAsset(userId, id);
    return res.status(200).json(new ApiResponse(200, null, result.message));
  }

  // Fallback to legacy UploadedImage collection
  const uploadRecord = await UploadedImage.findOne({ _id: id, user: userId });
  if (!uploadRecord) {
    throw new ApiError(404, 'Upload not found or access denied');
  }
  
  if (uploadRecord.publicId) {
    try {
      const { deleteFromCloudinary } = await import('../utils/cloudinaryHelper.js');
      await deleteFromCloudinary(uploadRecord.publicId);
    } catch (err) {
      console.error('Failed to delete upload image from Cloudinary:', err);
    }
  }
  
  await uploadRecord.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Upload deleted successfully'));
});

export const proxyImage = asyncHandler(async (req, res) => {
  const { url } = req.query;
  if (!url) {
    throw new ApiError(400, 'URL query parameter is required');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('Image proxy failed:', err);
    throw new ApiError(500, `Image proxy failed: ${err.message}`);
  }
});
