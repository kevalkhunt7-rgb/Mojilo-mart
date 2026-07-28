import wishlistService from '../services/wishlistService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);
  res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist retrieved'));
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.addToWishlist(req.user._id, req.body.productId);
  res.status(200).json(new ApiResponse(200, wishlist, 'Product added to wishlist'));
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
  res.status(200).json(new ApiResponse(200, wishlist, 'Product removed from wishlist'));
});