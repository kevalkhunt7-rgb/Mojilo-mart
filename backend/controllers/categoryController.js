import productService from '../services/productService.js';
import Category from '../models/Category.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, categories, 'Categories retrieved successfully')
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  const existingCategory = await Category.findOne({ name: name.trim() });

  if (existingCategory) {
    throw new ApiError(400, 'Category already exists');
  }

  const category = await Category.create({
    name: name.trim(),
    slug: slugify(name),
    image,
  });

  res.status(201).json(
    new ApiResponse(201, category, 'Category created successfully')
  );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (name) {
    const existingCategory = await Category.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });

    if (existingCategory) {
      throw new ApiError(400, 'Category already exists');
    }

    category.name = name.trim();
    category.slug = slugify(name);
  }

  if (image !== undefined) {
    category.image = image;
  }

  await category.save();

  res.status(200).json(
    new ApiResponse(200, category, 'Category updated successfully')
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await category.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully')
  );
});