import BaseRepository from './baseRepository.js';
import Category from '../models/Category.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findSubcategories(parentCategoryId) {
    return await Category.find({ parentCategory: parentCategoryId, isActive: true });
  }

  async findRootCategories() {
    return await Category.find({ parentCategory: null, isActive: true });
  }
}

export default new CategoryRepository();
