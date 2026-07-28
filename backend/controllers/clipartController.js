import Clipart from '../models/Clipart.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { uploadBufferToCloudinary, deleteFromCloudinary, applyBackgroundRemoval } from '../utils/cloudinaryHelper.js';

export const getCliparts = asyncHandler(async (req, res) => {
  // Admins should see all cliparts, visitors/customers only active ones
  const query = {};
  if (req.user && req.user.role === 'admin') {
    // include suspended/inactive ones
  } else {
    query.isActive = true;
  }
  
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  const cliparts = await Clipart.find(query).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, cliparts, 'Cliparts retrieved successfully'));
});

export const createClipart = asyncHandler(async (req, res) => {
  if (req.file) {
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'cliparts');
    req.body.imageUrl = applyBackgroundRemoval(uploadResult.secure_url);
    req.body.publicId = uploadResult.public_id;
  }
  
  const clipart = await Clipart.create(req.body);
  res.status(201).json(new ApiResponse(201, clipart, 'Clipart added successfully'));
});

export const updateClipart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const clipartDoc = await Clipart.findById(id);
  if (!clipartDoc) {
    throw new ApiError(404, 'Clipart not found');
  }

  if (req.file) {
    if (clipartDoc.publicId && !clipartDoc.publicId.startsWith('clipart_url_')) {
      try {
        await deleteFromCloudinary(clipartDoc.publicId);
      } catch (err) {
        console.error('Failed to delete old clipart image', err);
      }
    }
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'cliparts');
    req.body.imageUrl = applyBackgroundRemoval(uploadResult.secure_url);
    req.body.publicId = uploadResult.public_id;
  }

  const clipart = await Clipart.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!clipart) {
    throw new ApiError(404, 'Clipart not found');
  }
  res.status(200).json(new ApiResponse(200, clipart, 'Clipart updated successfully'));
});

export const deleteClipart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const clipart = await Clipart.findByIdAndDelete(id);
  if (!clipart) {
    throw new ApiError(404, 'Clipart not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Clipart deleted successfully'));
});

