import designService from '../services/designService.js';
import Design from '../models/Design.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary, applyBackgroundRemoval } from '../utils/cloudinaryHelper.js';

export const getPrintAreas = asyncHandler(async (req, res) => {
  const printAreas = await designService.getPrintAreasByProduct(req.params.productId);
  res.status(200).json(new ApiResponse(200, printAreas, 'Product printable areas retrieved'));
});

export const createPrintArea = asyncHandler(async (req, res) => {
  const printArea = await designService.createPrintArea(req.body);
  res.status(201).json(new ApiResponse(201, printArea, 'Printable area registered successfully'));
});

export const saveDesign = asyncHandler(async (req, res) => {
  if (req.file) {
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'designs');
    req.body.previewImage = {
      url: applyBackgroundRemoval(uploadResult.secure_url),
      publicId: uploadResult.public_id
    };
  }

  const design = await designService.saveUserDesign(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, design, 'Custom design saved successfully'));
});

export const getDesign = asyncHandler(async (req, res) => {
  const design = await designService.getDesignDetails(req.params.id);
  res.status(200).json(new ApiResponse(200, design, 'Design details retrieved'));
});

export const updateDesign = asyncHandler(async (req, res) => {
  if (req.file) {
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'designs');
    req.body.previewImage = {
      url: applyBackgroundRemoval(uploadResult.secure_url),
      publicId: uploadResult.public_id
    };
  }

  const updated = await designService.updateDesign(req.user, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, updated, 'Design updated successfully'));
});

export const getAllDesigns = asyncHandler(async (req, res) => {
  const designs = await Design.find({})
    .populate('user', 'name email')
    .populate('product', 'name title')
    .populate({
      path: 'customizations',
      populate: { path: 'printArea textLayers imageLayers' }
    })
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, designs, 'All designs retrieved successfully'));
});

export const deleteDesign = asyncHandler(async (req, res) => {
  const design = await Design.findById(req.params.id);
  if (!design) {
    throw new ApiError(404, 'Design not found');
  }

  // Delete associated customization docs and layers
  const Customization = (await import('../models/Customization.js')).default;
  const TextLayer = (await import('../models/TextLayer.js')).default;
  const ImageLayer = (await import('../models/ImageLayer.js')).default;

  if (design.customizations && design.customizations.length > 0) {
    for (const custId of design.customizations) {
      await TextLayer.deleteMany({ customization: custId });
      await ImageLayer.deleteMany({ customization: custId });
      await Customization.findByIdAndDelete(custId);
    }
  }

  await Design.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Custom design deleted successfully'));
});
export const restoreDesign = asyncHandler(async (req, res, next) => { //  Added req here
    const { versionId } = req.body; // or req.params depending on how you pass it
    const restored = await designService.restoreDesignVersion(req.params.id, versionId, req.user._id);
    res.status(200).json(new ApiResponse(200, restored, 'Design successfully restored to historical version'));
});


// Retrieve customization for reordering
export const getReorderCustomization = asyncHandler(async (req, res) => {
  const customization = await designService.getReorderCustomization(req.params.orderItemId, req.user._id);
  res.status(200).json(new ApiResponse(200, customization, 'Reorder design customization loaded successfully'));
});