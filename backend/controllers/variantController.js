import productService from '../services/productService.js';
import ProductVariant from '../models/ProductVariant.js';
import Attribute from '../models/Attribute.js';
import AttributeValue from '../models/AttributeValue.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// --- HELPER FUNCTION FOR RELATIONAL RESOLUTION ---
// Dynamically matches or provisions user-generated configurations into Attribute/AttributeValue collections
async function findOrCreateAttributeValue(attributeName, nameText, rawValue) {
  // 1. Locate or create the parent configuration category context (e.g., 'Color' or 'Size')
  let attr = await Attribute.findOne({ name: { $regex: new RegExp(`^${attributeName}$`, 'i') } });
  if (!attr) {
    attr = await Attribute.create({ name: attributeName });
  }

  // 2. Locate or provision the actual targeting value item under that specific parent context
  let attrValue = await AttributeValue.findOne({
    attribute: attr._id,
    value: rawValue.trim()
  });

  if (!attrValue) {
    attrValue = await AttributeValue.create({
      attribute: attr._id,
      name: nameText.trim(),
      value: rawValue.trim()
    });
  }

  return { attribute: attr._id, value: attrValue._id };
}

export const getProductVariants = asyncHandler(async (req, res) => {
  const variants = await productService.getVariantsByProduct(req.params.productId);
  res.status(200).json(new ApiResponse(200, variants, 'Product variants retrieved'));
});

export const createProductVariant = asyncHandler(async (req, res) => {
  const variant = await productService.createVariant(req.body);
  res.status(201).json(new ApiResponse(201, variant, 'Product variant created successfully'));
});

export const getAllVariants = asyncHandler(async (req, res) => {
  const variants = await ProductVariant.find({})
    .populate('product', 'name title images')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, variants, 'All product variants retrieved successfully'));
});



// --- UPDATED FOR FRONTEND LAYOUT WORKSPACE CONTROLS ---
export const updateProductVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sku, price, discount, inventory, colors, sizes } = req.body;

  // A. Check for overlapping SKU uniqueness across other variant instances
  if (sku) {
    const existingSku = await ProductVariant.findOne({ sku: sku.toUpperCase(), _id: { $ne: id } });
    if (existingSku) {
      throw new ApiError(400, 'The SKU code specified is already assigned to another variant.');
    }
  }

  // B. Build the direct flat payload to save straight to the schema fields
  const updatePayload = {
    sku: sku ? sku.toUpperCase() : undefined,
    price: price !== undefined ? Number(price) : undefined,
    discount: discount !== undefined ? Number(discount) : undefined,
    inventory: inventory !== undefined ? Number(inventory) : undefined,
    colors: colors || [], // Saves color array directly
    sizes: sizes || []    // Saves size array directly
  };

  // Strip empty/undefined keys so they don't overwrite current configurations
  Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

  // C. REMOVED the old relational .populate() string chain that was crashing your server
  const variant = await ProductVariant.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  if (!variant) {
    throw new ApiError(404, 'Variant not found');
  }

  res.status(200).json(new ApiResponse(200, variant, 'Product variant updated successfully'));
});

export const deleteProductVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const variant = await ProductVariant.findByIdAndDelete(id);
  if (!variant) {
    throw new ApiError(404, 'Variant not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Product variant deleted successfully'));
});

export const getAttributes = asyncHandler(async (req, res) => {
  let attributes = await Attribute.find({});
  if (attributes.length === 0) {
    // Seed Color Attribute
    const colorAttr = await Attribute.create({ name: 'Color' });
    await AttributeValue.create([
      { attribute: colorAttr._id, value: '#0F172A', name: 'Black' },
      { attribute: colorAttr._id, value: '#F8FAFC', name: 'White' },
      { attribute: colorAttr._id, value: '#DC2626', name: 'Red' },
      { attribute: colorAttr._id, value: '#1E3A8A', name: 'Blue' },
      { attribute: colorAttr._id, value: '#14532D', name: 'Green' }
    ]);

    // Seed Size Attribute
    const sizeAttr = await Attribute.create({ name: 'Size' });
    await AttributeValue.create([
      { attribute: sizeAttr._id, value: 'S', name: 'Small' },
      { attribute: sizeAttr._id, value: 'M', name: 'Medium' },
      { attribute: sizeAttr._id, value: 'L', name: 'Large' },
      { attribute: sizeAttr._id, value: 'XL', name: 'Extra Large' },
      { attribute: sizeAttr._id, value: '2XL', name: 'Double Extra Large' }
    ]);

    attributes = await Attribute.find({});
  }

  const result = [];
  for (const attr of attributes) {
    const values = await AttributeValue.find({ attribute: attr._id });
    result.push({
      _id: attr._id,
      name: attr.name,
      slug: attr.slug,
      values
    });
  }

  res.status(200).json(new ApiResponse(200, result, 'Attributes and values retrieved successfully'));
});

export const getVariantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const variant = await ProductVariant.findById(id).populate('product');
  if (!variant) {
    throw new ApiError(404, 'Variant not found');
  }
  res.status(200).json(new ApiResponse(200, variant, 'Product variant retrieved successfully'));
});

export const createAttributeValue = asyncHandler(async (req, res) => {
  const { attributeName, name, value } = req.body;
  if (!attributeName || !name || !value) {
    throw new ApiError(400, 'Attribute name, value display name, and raw value are required');
  }

  let attribute = await Attribute.findOne({ name: { $regex: new RegExp(`^${attributeName}$`, 'i') } });
  if (!attribute) {
    attribute = await Attribute.create({ name: attributeName });
  }

  const existingValue = await AttributeValue.findOne({ attribute: attribute._id, value });
  if (existingValue) {
    throw new ApiError(400, `${value} already exists under ${attributeName}`);
  }

  const newValue = await AttributeValue.create({
    attribute: attribute._id,
    name,
    value
  });

  res.status(201).json(new ApiResponse(201, newValue, 'Attribute option added successfully'));
});

export const deleteAttributeValue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const attrValue = await AttributeValue.findByIdAndDelete(id);
  if (!attrValue) {
    throw new ApiError(404, 'Attribute value not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Attribute option removed successfully'));
}); 