import productRepository from '../repositories/productRepository.js';
import categoryRepository from '../repositories/categoryRepository.js';
import Tag from '../models/Tag.js';
import Collection from '../models/Collection.js';
import ProductVariant from '../models/ProductVariant.js';
import ApiError from '../utils/ApiError.js';
import { getPagination } from '../utils/pagination.js';

class ProductService {
  async getProducts(queryParams) {
    const { page, limit, skip } = getPagination(queryParams);
    const { 
      keyword,
      search,
      categoryId,
      category,
      tagId, 
      collectionId, 
      minPrice, 
      maxPrice, 
      gender, 
      status, 
      sort 
    } = queryParams;

    const { products, total } = await productRepository.searchProducts({
      keyword: keyword || search,
      categoryId: categoryId || category,
      tagId,
      collectionId,
      minPrice,
      maxPrice,
      gender,
      status: status || undefined,
      skip,
      limit,
      sort
    });

    return {
      products,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductBySlug(slugOrId) {
    let product;

    // Search by ObjectId if valid 24-char hex string
    if (slugOrId && /^[0-9a-fA-F]{24}$/.test(slugOrId)) {
      product = await productRepository.findOne(
        { _id: slugOrId }, 
        'category tags collections variants'
      );
    }

    if (!product) {
      product = await productRepository.findOne(
        { slug: slugOrId }, 
        'category tags collections variants'
      );
    }

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return product;
  }

  async createProduct(productData) {
    return await productRepository.create(productData);
  }

  async updateProduct(id, updates) {
    const product = await productRepository.updateById(id, updates);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Soft delete main product
    await productRepository.updateById(id, { isActive: false });

    // Disable all associated variants
    await ProductVariant.updateMany({ product: id }, { isActive: false });

    return { message: 'Product and variants disabled successfully' };
  }

  // --- Variant Operations ---
  async createVariant(variantData) {
    const productExists = await productRepository.findById(variantData.product);
    if (!productExists) {
      throw new ApiError(404, 'Parent product not found');
    }
    
    return await ProductVariant.create(variantData);
  }

  async getVariantsByProduct(productId) {
    return await ProductVariant.find({ product: productId, isActive: true }).lean();
  }

  // --- Category Operations ---
  async getCategories() {
    return await categoryRepository.findRootCategories();
  }

  async getSubcategories(parentCategoryId) {
    return await categoryRepository.findSubcategories(parentCategoryId);
  }

  async createCategory(categoryData) {
    return await categoryRepository.create(categoryData);
  }

  // --- Tag & Collection Operations ---
  async getTags() {
    return await Tag.find({ isActive: true }).lean();
  }

  async createTag(tagData) {
    return await Tag.create(tagData);
  }

  async getCollections() {
    return await Collection.find({ isActive: true }).lean();
  }

  async createCollection(collectionData) {
    return await Collection.create(collectionData);
  }
}

export default new ProductService();