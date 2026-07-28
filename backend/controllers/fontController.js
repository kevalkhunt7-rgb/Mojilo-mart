import Font from '../models/Font.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getFonts = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user && req.user.role === 'admin') {
    // include suspended/inactive ones
  } else {
    query.isActive = true;
  }
  const fonts = await Font.find(query).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, fonts, 'Available fonts retrieved'));
});

export const createFont = asyncHandler(async (req, res) => {
  const font = await Font.create(req.body);
  res.status(201).json(new ApiResponse(201, font, 'Font registered successfully'));
});

export const updateFont = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const font = await Font.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!font) {
    throw new ApiError(404, 'Font not found');
  }
  res.status(200).json(new ApiResponse(200, font, 'Font updated successfully'));
});

export const deleteFont = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const font = await Font.findByIdAndDelete(id);
  if (!font) {
    throw new ApiError(404, 'Font not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Font deleted successfully'));
});

