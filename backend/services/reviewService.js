import reviewRepository from '../repositories/reviewRepository.js';
import productRepository from '../repositories/productRepository.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

class ReviewService {
  async addProductReview(userId, productId, { rating, comment, title, images }) {
    // 1. Verify if user already reviewed
    const existing = await reviewRepository.findOne({ user: userId, product: productId });
    if (existing) {
      throw new ApiError(400, 'You have already reviewed this product');
    }

    // 2. Check if verified purchase
    // Find delivered orders of user containing this product
    const deliveredOrder = await Order.findOne({
      user: userId,
      orderStatus: 'delivered'
    }).populate({
      path: 'items',
      match: { product: productId }
    });

    const isVerifiedPurchase = !!(deliveredOrder && deliveredOrder.items && deliveredOrder.items.length > 0);

    // 3. Create review
    const review = await reviewRepository.create({
      user: userId,
      product: productId,
      rating,
      comment,
      title,
      images: images || [],
      isVerifiedPurchase
    });

    // 4. Update product rating stats
    const { averageRating, count } = await reviewRepository.getAverageRating(productId);
    await productRepository.updateById(productId, {
      rating: averageRating,
      reviewsCount: count
    });

    return review;
  }

  async getProductReviews(productId) {
    return await reviewRepository.findByProductId(productId);
  }
}

export default new ReviewService();
