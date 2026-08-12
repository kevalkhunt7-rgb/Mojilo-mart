import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

function normalizeId(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed === 'undefined' || trimmed === 'null') return null;
    return trimmed;
  }
  if (typeof val === 'object') {
    if (val._id) return normalizeId(val._id);
    if (val.id) return normalizeId(val.id);
    if (val.productId) return normalizeId(val.productId);
    if (typeof val.toString === 'function') {
      const str = val.toString();
      if (str && str !== '[object Object]') return str;
    }
  }
  return null;
}

class ReviewService {
  /**
   * Check if a user is eligible to review a specific product
   */
  async checkEligibility(userId, productId) {
    const cleanUserId = normalizeId(userId);
    const cleanProductId = normalizeId(productId);

    if (!cleanUserId || !cleanProductId || !mongoose.Types.ObjectId.isValid(cleanProductId)) {
      return { canReview: false, reason: 'Invalid parameters', existingReview: null };
    }

    // 1. Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: cleanUserId, product: cleanProductId }).lean();

    // 2. Find delivered orders for this user
    const deliveredOrders = await Order.find({ user: cleanUserId, orderStatus: 'delivered' }).select('_id orderNumber createdAt').lean();
    if (!deliveredOrders || deliveredOrders.length === 0) {
      return {
        canReview: false,
        reason: 'Reviews can only be submitted for delivered orders.',
        existingReview: existingReview || null
      };
    }

    const orderIds = deliveredOrders.map(o => o._id);
    const orderItems = await OrderItem.find({
      order: { $in: orderIds },
      $or: [
        { product: cleanProductId },
        { productId: cleanProductId },
        { _id: cleanProductId }
      ]
    }).lean();

    if (!orderItems || orderItems.length === 0) {
      return {
        canReview: false,
        reason: 'You have not purchased this product in a delivered order.',
        existingReview: existingReview || null
      };
    }

    const firstItem = orderItems[0];
    return {
      canReview: !existingReview,
      alreadyReviewed: Boolean(existingReview),
      existingReview: existingReview || null,
      eligibleOrder: {
        orderId: firstItem.order,
        orderItemId: firstItem._id
      }
    };
  }

  /**
   * Create a new review with Cloudinary image uploads & product aggregation
   */
  async createReview(user, { productId, orderId, orderItemId, rating, title, text }, files = []) {
    const cleanProductId = normalizeId(productId);
    const cleanOrderId = normalizeId(orderId);
    const cleanOrderItemId = normalizeId(orderItemId);

    if (!cleanProductId) {
      throw new ApiError(400, 'Product ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(cleanProductId)) {
      throw new ApiError(400, `Invalid Product ID: ${productId}`);
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new ApiError(400, 'Rating must be an integer between 1 and 5');
    }

    // Prevent duplicate reviews
    const existing = await Review.findOne({ user: user._id, product: cleanProductId });
    if (existing) {
      throw new ApiError(409, 'You have already submitted a review for this product.');
    }

    // If orderId / orderItemId are missing, auto-discover from user's delivered orders
    let targetOrderId = cleanOrderId;
    let targetOrderItemId = cleanOrderItemId;

    if (!targetOrderId || !targetOrderItemId) {
      const eligibility = await this.checkEligibility(user._id, cleanProductId);
      if (!eligibility.eligibleOrder) {
        throw new ApiError(400, eligibility.reason || 'Reviews can only be submitted for delivered orders containing this product.');
      }
      targetOrderId = eligibility.eligibleOrder.orderId;
      targetOrderItemId = eligibility.eligibleOrder.orderItemId;
    } else {
      // Validate provided order
      const order = await Order.findById(targetOrderId);
      if (!order) throw new ApiError(404, 'Order not found');
      if (order.user.toString() !== user._id.toString()) throw new ApiError(403, 'You do not own this order');
      if (order.orderStatus !== 'delivered') throw new ApiError(400, 'Reviews can only be submitted for delivered orders');
    }

    if (files.length > 3) {
      throw new ApiError(400, 'Maximum 3 images are allowed per review');
    }

    // Upload images to Cloudinary concurrently in parallel
    const reviewImages = await Promise.all(
      files.map(async (f) => {
        const result = await uploadBufferToCloudinary(f.buffer, 'reviews', { resource_type: 'image' });
        return {
          url: result.secure_url,
          publicId: result.public_id,
          mimeType: f.mimetype
        };
      })
    );

    const review = await Review.create({
      user: user._id,
      product: cleanProductId,
      order: targetOrderId,
      orderItem: targetOrderItemId,
      rating: ratingNum,
      title: title ? String(title).trim() : '',
      text: text ? String(text).trim() : '',
      reviewImages,
      verifiedPurchase: true,
      isApproved: true
    });

    await this.recalculateProductAggregates(productId);

    return review;
  }

  /**
   * Recalculate average rating, total reviews count, and rating distribution on Product schema
   */
  async recalculateProductAggregates(productId) {
    if (!productId) return;
    const prodId = typeof productId === 'string' ? new mongoose.Types.ObjectId(productId) : productId;

    const agg = await Review.aggregate([
      { $match: { product: prodId, isApproved: true } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
          counts: { $push: '$rating' }
        }
      }
    ]);

    const distribution = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    let avg = 0;
    let total = 0;

    if (agg.length > 0) {
      avg = agg[0].avgRating;
      total = agg[0].total;
      for (const r of agg[0].counts) {
        const k = String(r);
        if (distribution[k] !== undefined) distribution[k] += 1;
      }
    }

    try {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round((avg || 0) * 10) / 10,
        reviewsCount: total,
        ratingDistribution: distribution
      });
    } catch (err) {
      // Ignore if productId is an OrderItem ID or non-catalog item
    }
  }

  /**
   * Get public reviews for a product with pagination, sorting & image filters
   */
  async getProductReviews(productId, { page = 1, limit = 10, sort = 'newest', imagesOnly = false, rating } = {}) {
    const skip = (page - 1) * limit;
    const filter = { product: productId, isApproved: true };

    if (imagesOnly) {
      filter['reviewImages.0'] = { $exists: true };
    }
    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      filter.rating = Number(rating);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'highest') sortObj = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortObj = { rating: 1, createdAt: -1 };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter)
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get current user's submitted reviews
   */
  async getMyReviews(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const filter = { user: userId };
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('product', 'name image images basePrice salePrice price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter)
    ]);

    return { reviews, total, page, limit };
  }

  /**
   * Edit an existing review
   */
  async updateReview(user, reviewId, { rating, title, text }, files = []) {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    if (review.user.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new ApiError(403, 'You are not authorized to update this review');
    }

    if (files && files.length > 0) {
      if (files.length > 3) throw new ApiError(400, 'Maximum 3 images are allowed');
      // Delete old Cloudinary images
      for (const img of review.reviewImages || []) {
        if (img.publicId) {
          try { await deleteFromCloudinary(img.publicId); } catch (e) {}
        }
      }
      const newImgs = await Promise.all(
        files.map(async (f) => {
          const result = await uploadBufferToCloudinary(f.buffer, 'reviews', { resource_type: 'image' });
          return {
            url: result.secure_url,
            publicId: result.public_id,
            mimeType: f.mimetype
          };
        })
      );
      review.reviewImages = newImgs;
    }

    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        throw new ApiError(400, 'Rating must be an integer between 1 and 5');
      }
      review.rating = ratingNum;
    }

    if (title !== undefined) review.title = String(title).trim();
    if (text !== undefined) review.text = String(text).trim();

    await review.save();
    await this.recalculateProductAggregates(review.product);
    return review;
  }

  /**
   * Delete a review & purge Cloudinary images
   */
  async deleteReview(user, reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    if (review.user.toString() !== user._id.toString() && user.role !== 'admin') {
      throw new ApiError(403, 'You are not authorized to delete this review');
    }

    // Delete Cloudinary assets
    for (const img of review.reviewImages || []) {
      if (img.publicId) {
        try { await deleteFromCloudinary(img.publicId); } catch (e) {}
      }
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);
    await this.recalculateProductAggregates(productId);

    return true;
  }

  /**
   * Admin listing of reviews with multi-criteria filtering
   */
  async adminList({ page = 1, limit = 20, filters = {}, sort = 'newest' } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (filters.product) query.product = filters.product;
    if (filters.user) query.user = filters.user;
    if (filters.rating) query.rating = Number(filters.rating);
    if (filters.isApproved !== undefined) query.isApproved = filters.isApproved;

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { text: { $regex: filters.search, $options: 'i' } }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'highest') sortObj = { rating: -1 };
    if (sort === 'lowest') sortObj = { rating: 1 };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .populate('product', 'name image images')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query)
    ]);

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Admin moderation: approve or hide review
   */
  async adminModerateStatus(reviewId, isApproved) {
    const review = await Review.findById(reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    review.isApproved = Boolean(isApproved);
    await review.save();
    await this.recalculateProductAggregates(review.product);
    return review;
  }
}

export default new ReviewService();
