import customizationService from '../services/customizationService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCustomization = asyncHandler(async (req, res) => {
  // Check if caller requests excluding heavy canvas data (e.g. ?excludeCanvas=true)
  const excludeCanvas = req.query.excludeCanvas === 'true';

  const result = await customizationService.getCustomizationDetails(req.params.id, { excludeCanvas });
  res.status(200).json(new ApiResponse(200, result, 'Customization details retrieved'));
});

export const createCustomization = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const sessionId = req.headers['x-session-id'] || null;

  const customization = await customizationService.createCustomization({
    ...req.body,
    userId,
    sessionId
  });

  res.status(201).json(new ApiResponse(201, customization, 'Customization created successfully'));
});

export const updateCustomization = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const sessionId = req.headers['x-session-id'] || null;

  const customization = await customizationService.updateCustomization(req.params.id, {
    ...req.body,
    userId,
    sessionId
  });

  res.status(200).json(new ApiResponse(200, customization, 'Customization updated successfully'));
});

export const deleteCustomization = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const result = await customizationService.deleteCustomization(req.params.id, { userId });
  res.status(200).json(new ApiResponse(200, null, result.message));
});