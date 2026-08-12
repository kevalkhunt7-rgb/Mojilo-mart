import asyncHandler from '../utils/asyncHandler.js';
import reviewService from '../services/reviewService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const checkEligibility = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const result = await reviewService.checkEligibility(req.user._id, productId);
  res.status(200).json(new ApiResponse(200, result, 'Eligibility checked'));
});

export const createReview = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const payload = req.body || {};

  // Reject base64 image payload strings
  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (typeof val === 'string' && val.startsWith('data:image/')) {
      return res.status(400).json(new ApiResponse(400, null, 'Base64 image strings are not accepted. Upload image files directly.'));
    }
  }

  const review = await reviewService.createReview(req.user, {
    productId: payload.productId,
    orderId: payload.orderId,
    orderItemId: payload.orderItemId,
    rating: Number(payload.rating),
    title: payload.title,
    text: payload.text || payload.reviewText,
  }, files);

  res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest', imagesOnly, rating } = req.query;
  const result = await reviewService.getProductReviews(req.params.productId, {
    page: Number(page),
    limit: Number(limit),
    sort,
    imagesOnly: imagesOnly === 'true',
    rating: rating ? Number(rating) : undefined
  });
  res.status(200).json(new ApiResponse(200, result, 'Product reviews retrieved successfully'));
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await reviewService.getMyReviews(req.user._id, { page: Number(page), limit: Number(limit) });
  res.status(200).json(new ApiResponse(200, result, 'User reviews retrieved successfully'));
});

export const updateReview = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const payload = req.body || {};

  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (typeof val === 'string' && val.startsWith('data:image/')) {
      return res.status(400).json(new ApiResponse(400, null, 'Base64 image strings are not accepted. Upload image files directly.'));
    }
  }

  const updated = await reviewService.updateReview(req.user, req.params.id, {
    rating: payload.rating ? Number(payload.rating) : undefined,
    title: payload.title,
    text: payload.text || payload.reviewText,
  }, files);

  res.status(200).json(new ApiResponse(200, updated, 'Review updated successfully'));
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully'));
});

export const adminListReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = 'newest', product, user, rating, isApproved, search } = req.query;
  const filters = {
    product: product || undefined,
    user: user || undefined,
    rating: rating || undefined,
    search: search || undefined,
    isApproved: isApproved === undefined ? undefined : (isApproved === 'true')
  };
  const result = await reviewService.adminList({ page: Number(page), limit: Number(limit), filters, sort });
  res.status(200).json(new ApiResponse(200, result, 'Admin reviews list retrieved'));
});

export const adminModerateReview = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;
  const review = await reviewService.adminModerateStatus(req.params.id, isApproved);
  res.status(200).json(new ApiResponse(200, review, `Review status updated to ${review.isApproved ? 'Approved' : 'Hidden'}`));
});

export const adminDeleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.user, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Review deleted by admin'));
});
