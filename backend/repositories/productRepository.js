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
    limit = 20
  }) {
    const query = {};

    if (status && status.toLowerCase() !== 'all') {
      query.status = status;
      query.isActive = true;
    } else if (!status) {
      query.isActive = true;
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

    const pageLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    // 1. Use MongoDB Atlas Search ($search aggregation) on index 'default' when keyword is present
    if (keyword && keyword.trim() !== '') {
      const searchKeyword = keyword.trim();
      
      const searchPipeline = [
        {
          $search: {
            index: 'default',
            text: {
              query: searchKeyword,
              path: { wildcard: '*' },
              fuzzy: {
                maxEdits: 1,
                prefixLength: 1
              }
            }
          }
        }
      ];

      if (Object.keys(query).length > 0) {
        searchPipeline.push({ $match: query });
      }

      const facetPipeline = [
        ...searchPipeline,
        {
          $facet: {
            products: [
              { $sort: sortObj },
              { $skip: Number(skip) },
              { $limit: pageLimit },
              { $project: { description: 0, sizeChart: 0 } }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ];

      try {
        const aggregateResult = await Product.aggregate(facetPipeline);
        const productsRaw = aggregateResult[0]?.products || [];
        const total = aggregateResult[0]?.totalCount[0]?.count || 0;

        const products = await Product.populate(productsRaw, [
          { path: 'category', select: 'name slug' },
          { path: 'tags', select: 'name' },
          { path: 'collections', select: 'name' }
        ]);

        return { products, total };
      } catch (err) {
        console.warn('[Atlas Search Notice]: $search aggregation fallback triggered:', err.message);
        // Fallback to text index / regex search if $search is not supported in local DB environment
        query.$text = { $search: searchKeyword };
      }
    }

    // 2. Default query execution for non-search catalog browsing or fallback
    const [products, total] = await Promise.all([
      Product.find(query)
        .select('-description -sizeChart')
        .populate('category', 'name slug')
        .populate('tags', 'name')
        .populate('collections', 'name')
        .sort(sortObj)
        .skip(Number(skip))
        .limit(pageLimit)
        .lean({ virtuals: true }),
      Product.countDocuments(query)
    ]);

    return { products, total };
  }

  async getFeaturedProducts(limit = 8) {
    return await Product.find({ featured: true, isActive: true })
      .select('-description -sizeChart')
      .populate('category', 'name slug')
      .limit(Number(limit))
      .lean({ virtuals: true });
  }

  async getNewArrivals(limit = 8) {
    return await Product.find({ newArrival: true, isActive: true })
      .select('-description -sizeChart')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean({ virtuals: true });
  }
}

export default new ProductRepository();