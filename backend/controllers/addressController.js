import userService from '../services/userService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await userService.getAddresses(req.user._id);
  res.status(200).json(new ApiResponse(200, addresses, 'User addresses retrieved'));
});

export const addAddress = asyncHandler(async (req, res) => {
  const newAddress = await userService.addAddress(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, newAddress, 'Address added successfully'));
});

export const updateAddress = asyncHandler(async (req, res) => {
  const updatedAddress = await userService.updateAddress(req.user._id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, updatedAddress, 'Address updated successfully'));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const result = await userService.deleteAddress(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Address removed successfully'));
});
