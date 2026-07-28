import reviewService from '../services/reviewService.js';
import Review from '../models/Review.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const addProductReview = asyncHandler(async (req, res) => {
  const review = await reviewService.addProductReview(req.user._id, req.params.productId, req.body);
  res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.productId);
  res.status(200).json(new ApiResponse(200, reviews, 'Reviews retrieved successfully'));
});

export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name email')
    .populate('product', 'name title images')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, reviews, 'All reviews retrieved successfully'));
});

export const toggleReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.isActive = !review.isActive;
  await review.save();

  res.status(200).json(new ApiResponse(200, review, `Review status updated to ${review.isActive ? 'Active' : 'Hidden'}`));
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully'));
});

