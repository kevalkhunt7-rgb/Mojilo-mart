import userService from '../services/userService.js';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, profile, 'User profile retrieved'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, updated, 'Profile updated successfully'));
});

export const getOrderHistory = asyncHandler(async (req, res) => {
  const history = await userService.getOrderHistory(req.user._id);
  res.status(200).json(new ApiResponse(200, history, 'Order history retrieved'));
});

export const getSavedDesigns = asyncHandler(async (req, res) => {
  const designs = await userService.getSavedDesigns(req.user._id);
  res.status(200).json(new ApiResponse(200, designs, 'Saved designs retrieved'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, users, 'All users retrieved successfully'));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Toggle between active and suspended
  user.status = user.status === 'active' ? 'suspended' : 'active';
  await user.save();

  res.status(200).json(new ApiResponse(200, user, `User status updated to ${user.status}`));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['customer', 'admin', 'moderator'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, user, `User role updated to ${role}`));
});