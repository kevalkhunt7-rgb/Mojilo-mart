import productService from '../services/productService.js';
import Category from '../models/Category.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';
import { cloudinary } from '../config/cloudinary.js';

const processCategoryImage = async (imageInput) => {
  if (!imageInput || typeof imageInput !== 'string') return '';

  // If already a valid HTTP / Cloudinary URL, return as-is
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    return imageInput;
  }

  // If Base64 string, upload to Cloudinary
  if (imageInput.startsWith('data:image/') || imageInput.length > 500) {
    try {
      const result = await cloudinary.uploader.upload(imageInput, {
        folder: 'categories',
      });
      return result.secure_url;
    } catch (err) {
      console.error('Failed to upload category image to Cloudinary:', err);
      throw new ApiError(500, 'Failed to process category image upload');
    }
  }

  return imageInput;
};

export const getCategories = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  if (page || limit) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [categories, total] = await Promise.all([
      Category.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Category.countDocuments(),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          categories,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        'Categories retrieved successfully'
      )
    );
  }

  const categories = await Category.find()
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    new ApiResponse(
      200,
      categories,
      'Categories retrieved successfully'
    )
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  const existingCategory = await Category.findOne({
    name: name.trim()
  });

  if (existingCategory) {
    throw new ApiError(400, 'Category already exists');
  }

  let imageUrl = '';
  if (image) {
    imageUrl = await processCategoryImage(image);
  }

  const category = await Category.create({
    name: name.trim(),
    slug: slugify(name),
    image: imageUrl
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
      _id: { $ne: id }
    });

    if (existingCategory) {
      throw new ApiError(400, 'Category already exists');
    }

    category.name = name.trim();
    category.slug = slugify(name);
  }

  if (image !== undefined) {
    if (image) {
      category.image = await processCategoryImage(image);
    } else {
      category.image = '';
    }
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