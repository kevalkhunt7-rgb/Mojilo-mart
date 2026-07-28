import BaseRepository from './baseRepository.js';
import Product from '../models/Product.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async searchProducts({
    keyword,
    categoryId,
    tagId,
    collectionId,
    minPrice,
    maxPrice,
    gender,
    status,
    sort,
    skip = 0,
    limit = 10
  }) {
    const query = {};

    if (status && status.toLowerCase() !== 'all') {
      query.status = status;
    }

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { searchTags: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (categoryId && categoryId.toLowerCase() !== 'all') {
      query.category = categoryId;
    }

    if (tagId && tagId.toLowerCase() !== 'all') {
      query.tags = tagId;
    }

    if (collectionId && collectionId.toLowerCase() !== 'all') {
      query.collections = collectionId;
    }

    if (gender && gender.toLowerCase() !== 'all') {
      query.gender = gender;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.basePrice = {};
      if (minPrice !== undefined && minPrice !== '') query.basePrice.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.basePrice.$lte = Number(maxPrice);
    }

    // Sort definition
    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { basePrice: 1 };
    if (sort === 'price-desc') sortObj = { basePrice: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };

    // Replaced 'brand' with 'category tags collections'
    const products = await Product.find(query)
      .populate('category tags collections')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return { products, total };
  }

  async getFeaturedProducts(limit = 8) {
    return await Product.find({ featured: true, isActive: true })
      .populate('category tags collections')
      .limit(limit);
  }

  async getNewArrivals(limit = 8) {
    return await Product.find({ newArrival: true, isActive: true })
      .populate('category tags collections')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default new ProductRepository();