import productService from '../services/productService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';

const parseJSONField = (value, fallback = []) => {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.error(`Failed to parse JSON field: ${value}`, err);
    return fallback;
  }
};

const formatSizeObjects = (rawSizes = [], salePrice, basePrice) => {
  if (!Array.isArray(rawSizes)) return [];
  const defaultPrice = (salePrice !== undefined && salePrice !== null && salePrice !== '') 
    ? Number(salePrice) 
    : Number(basePrice || 0);

  return rawSizes.map((item) => {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      return trimmed ? { size: trimmed, price: defaultPrice } : null;
    }
    if (item && typeof item === 'object') {
      const sizeVal = (item.size || item.name || '').toString().trim();
      if (!sizeVal) return null;
      const customPrice = (item.price !== undefined && item.price !== null && item.price !== '')
        ? Number(item.price)
        : null;
      return {
        size: sizeVal,
        price: customPrice !== null && !isNaN(customPrice) ? customPrice : defaultPrice,
      };
    }
    return null;
  }).filter(Boolean);
};

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.status(200).json(new ApiResponse(200, result, 'Products retrieved successfully'));
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  res.status(200).json(new ApiResponse(200, product, 'Product details retrieved'));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.id);
  res.status(200).json(new ApiResponse(200, product, 'Product details retrieved'));
});

export const createProduct = asyncHandler(async (req, res) => {
  const imageUrls = [];
  let sizeChartUrl = '';

  let imageFiles = [];
  let sizeChartFile = null;

  if (req.files) {
    if (Array.isArray(req.files)) {
      imageFiles = req.files;
    } else {
      if (req.files.images) imageFiles = req.files.images;
      if (req.files.sizeChart && req.files.sizeChart[0]) sizeChartFile = req.files.sizeChart[0];
    }
  }

  // Upload images concurrently instead of sequentially
  if (imageFiles.length > 0) {
    const uploadPromises = imageFiles.map(file => uploadBufferToCloudinary(file.buffer, 'products'));
    const results = await Promise.all(uploadPromises);
    results.forEach(result => {
      imageUrls.push({ url: result.secure_url, publicId: result.public_id });
    });
  }

  if (sizeChartFile) {
    const result = await uploadBufferToCloudinary(sizeChartFile.buffer, 'size_charts');
    sizeChartUrl = result.secure_url;
  }

  const basePrice = Number(req.body.basePrice || req.body.price || 0);
  const salePrice = req.body.salePrice !== undefined && req.body.salePrice !== '' ? Number(req.body.salePrice) : undefined;
  const colors = parseJSONField(req.body.colors, []);
  const rawSizes = parseJSONField(req.body.sizes, []);
  const sizes = formatSizeObjects(rawSizes, salePrice, basePrice);
  const searchTags = parseJSONField(req.body.searchTags, []);
  const tags = parseJSONField(req.body.tags, []);
  const collections = parseJSONField(req.body.collections, []);

  const productData = {
    ...req.body,
    basePrice,
    salePrice,
    images: imageUrls,
    colors,
    sizes,
    searchTags,
    tags,
    collections,
    newArrival: req.body.newArrival === 'true' || req.body.newArrival === true,
    featured: req.body.featured === 'true' || req.body.featured === true,
  };

  if (sizeChartUrl) {
    productData.sizeChart = sizeChartUrl;
  }

  const product = await productService.createProduct(productData);
  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  let imageUrls = [];

  if (req.body.existingImages) {
    imageUrls = parseJSONField(req.body.existingImages, []);
  }

  let newImageFiles = [];
  let sizeChartFile = null;

  if (req.files) {
    if (Array.isArray(req.files)) {
      newImageFiles = req.files;
    } else {
      if (req.files.images) newImageFiles = req.files.images;
      if (req.files.sizeChart && req.files.sizeChart[0]) sizeChartFile = req.files.sizeChart[0];
    }
  }

  if (newImageFiles.length > 0) {
    const uploadPromises = newImageFiles.map(file => uploadBufferToCloudinary(file.buffer, 'products'));
    const results = await Promise.all(uploadPromises);
    results.forEach(result => {
      imageUrls.push({ url: result.secure_url, publicId: result.public_id });
    });
  }

  let sizeChartUrl = undefined;
  if (sizeChartFile) {
    const result = await uploadBufferToCloudinary(sizeChartFile.buffer, 'size_charts');
    sizeChartUrl = result.secure_url;
  }

  const updates = { ...req.body };

  if (req.body.price || req.body.basePrice) {
    updates.basePrice = Number(req.body.price || req.body.basePrice);
  }
  if (req.body.salePrice !== undefined) {
    updates.salePrice = req.body.salePrice !== '' ? Number(req.body.salePrice) : null;
  }

  if (newImageFiles.length > 0 || req.body.existingImages !== undefined) {
    updates.images = imageUrls;
  }

  if (sizeChartUrl !== undefined) {
    updates.sizeChart = sizeChartUrl;
  } else if (req.body.sizeChart === '') {
    updates.sizeChart = '';
  }

  if (req.body.colors !== undefined) updates.colors = parseJSONField(req.body.colors, []);
  if (req.body.sizes !== undefined) {
    const rawSizes = parseJSONField(req.body.sizes, []);
    const basePrice = updates.basePrice !== undefined ? updates.basePrice : Number(req.body.price || req.body.basePrice || 0);
    const salePrice = updates.salePrice !== undefined ? updates.salePrice : (req.body.salePrice !== '' ? Number(req.body.salePrice) : undefined);
    updates.sizes = formatSizeObjects(rawSizes, salePrice, basePrice);
  }
  if (req.body.searchTags !== undefined) updates.searchTags = parseJSONField(req.body.searchTags, []);
  if (req.body.tags !== undefined) updates.tags = parseJSONField(req.body.tags, []);
  if (req.body.collections !== undefined) updates.collections = parseJSONField(req.body.collections, []);

  if (req.body.newArrival !== undefined) {
    updates.newArrival = req.body.newArrival === 'true' || req.body.newArrival === true;
  }
  if (req.body.featured !== undefined) {
    updates.featured = req.body.featured === 'true' || req.body.featured === true;
  }

  const product = await productService.updateProduct(req.params.id, updates);
  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Product disabled successfully'));
});

export const getTags = asyncHandler(async (req, res) => {
  const tags = await productService.getTags();
  res.status(200).json(new ApiResponse(200, tags, 'Tags retrieved successfully'));
});

export const getCollections = asyncHandler(async (req, res) => {
  const collections = await productService.getCollections();
  res.status(200).json(new ApiResponse(200, collections, 'Collections retrieved successfully'));
});