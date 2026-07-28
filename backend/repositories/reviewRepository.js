import BaseRepository from './baseRepository.js';
import Review from '../models/Review.js';

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByProductId(productId) {
    return await Review.find({ product: productId, isActive: true })
      .populate('user', 'name');
  }

  async getAverageRating(productId) {
    const stats = await Review.aggregate([
      { $match: { product: productId, isActive: true } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    return stats[0] || { averageRating: 5, count: 0 };
  }
}

export default new ReviewRepository();
