import cartService from '../services/cartService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  const cart = await cartService.getOrCreateCart({
    userId: req.user ? req.user._id : null,
    sessionId
  });
  res.status(200).json(new ApiResponse(200, cart, 'Cart retrieved'));
});

export const addToCart = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;

  // CartContext sends customization details nested under `customizationData`.
  // cartService.addCustomizedProduct expects them as flat fields.
  const {
    productId,
    variantId,
    quantity,
    color,
    size,
    customizationId: directCustomizationId,
    customizationData,
  } = req.body;

  // Flatten: prefer top-level fields, fall back to customizationData sub-fields
  const resolvedCustomizationId = directCustomizationId || customizationData?.customizationId || null;
  const resolvedColor  = color  || customizationData?.selectedColor || customizationData?.color || null;
  const resolvedSize   = size   || customizationData?.selectedSize  || customizationData?.size  || null;

  const cart = await cartService.addCustomizedProduct(
    { userId: req.user ? req.user._id : null, sessionId },
    {
      productId,
      variantId:       variantId   || null,
      customizationId: resolvedCustomizationId,
      color:           resolvedColor,
      size:            resolvedSize,
      quantity:        quantity || 1,
    }
  );
  res.status(200).json(new ApiResponse(200, cart, 'Item added to cart'));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.body.sessionId;
  const cart = await cartService.updateCustomizedProduct(
    { userId: req.user ? req.user._id : null, sessionId },
    req.params.itemId,
    req.body
  );
  res.status(200).json(new ApiResponse(200, cart, 'Cart item updated'));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  const cart = await cartService.removeCustomizedProduct(
    { userId: req.user ? req.user._id : null, sessionId },
    req.params.itemId
  );
  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});

export const mergeCart = asyncHandler(async (req, res) => {
  const sessionId = req.body.sessionId;
  if (!sessionId) {
    return res.status(400).json(new ApiResponse(400, null, 'Session ID is required'));
  }
  const cart = await cartService.mergeGuestCart(sessionId, req.user._id);
  res.status(200).json(new ApiResponse(200, cart, 'Guest cart merged successfully'));
});