import customCartService from '../services/customCartService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCustomCart = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  const cart = await customCartService.getOrCreateCart({
    userId: req.user ? req.user._id : null,
    sessionId
  });
  res.status(200).json(new ApiResponse(200, cart, 'Custom cart retrieved'));
});

export const addCustomItem = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;
  const { customizationId, clothingType, size, color, quantity } = req.body;

  const cart = await customCartService.addCustomTemplateToCart(
    { userId: req.user ? req.user._id : null, sessionId },
    { customizationId, clothingType, size, color, quantity: quantity || 1 }
  );
  res.status(200).json(new ApiResponse(200, cart, 'Custom template added to cart'));
});

export const updateCustomItem = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;
  const { quantity } = req.body;

  const cart = await customCartService.updateQuantity(
    { userId: req.user ? req.user._id : null, sessionId },
    req.params.itemId,
    quantity
  );
  res.status(200).json(new ApiResponse(200, cart, 'Custom cart item updated'));
});

export const removeCustomItem = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;

  const cart = await customCartService.removeFromCart(
    { userId: req.user ? req.user._id : null, sessionId },
    req.params.itemId
  );
  res.status(200).json(new ApiResponse(200, cart, 'Custom cart item removed'));
});
