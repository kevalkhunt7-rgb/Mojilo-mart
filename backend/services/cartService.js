import cartRepository from '../repositories/cartRepository.js';
import Customization from '../models/Customization.js';
import Layer from '../models/Layer.js';
import Asset from '../models/Asset.js';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import Cart from '../models/Cart.js';
import ApiError from '../utils/ApiError.js';
import pricingService from './pricingService.js';
import logger from '../utils/logger.js';

// Predefined base prices for frontend clothing types (INR)
const TEMPLATE_BASE_PRICES = {
  'half_sleeve_t_shirt': 299,
  'long_sleeve_t_shirt': 399,
  'oversized_t_shirt': 449,
  'hoodie': 699,
  'sports_jersey': 499,
  'half-sleeve': 299,
  'long-sleeve': 399,
  'oversized': 449,
  'sports-jersey': 499
};

// Helper utility to normalize tracking keys (removes spaces, hyphens, and underscores)
const cleanKey = (str) => String(str || '').toLowerCase().replace(/[\s_-]/g, '');

class CartService {
  /**
   * Retrieve active cart or create a new one
   * @param {object} params { userId, sessionId }
   * @returns {object} Cart document
   */
  async getOrCreateCartDoc({ userId, sessionId }) {
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = await Cart.create({ sessionId, items: [], totalAmount: 0 });
      }
    } else {
      throw new ApiError(400, 'Either User ID or Session ID is required to retrieve the cart');
    }
    return cart;
  }

  /**
   * Populate a raw Cart document with product and customization data,
   * enriching each item with the image/name info the frontend needs.
   */
  async populateCart(cartDoc) {
    if (!cartDoc) return null;

    // Re-fetch with full population so the frontend gets all display fields
    const populated = await Cart.findById(cartDoc._id)
      .populate({ path: 'items.product' })
      .populate({ path: 'items.customization' })
      .lean({ virtuals: true });

    if (!populated) return cartDoc.toObject ? cartDoc.toObject() : cartDoc;

    for (const item of populated.items) {
      const customization = item.customization;

      // Check if it's a template item or database product
      const templateKey = customization?.baseTemplateId || customization?.clothingType || item.variant || item.product;
      const matchKey = Object.keys(TEMPLATE_BASE_PRICES).find(
        k => cleanKey(k) === cleanKey(templateKey)
      );

      if (matchKey) {
        // Build virtual product and variant for template item
        const basePrice = TEMPLATE_BASE_PRICES[matchKey];
        const title = customization?.clothingType || matchKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        item.product = {
          _id: null,
          name: title,
          title: title,
          images: [
            {
              url: customization?.previewUrl || customization?.previews?.mockup || customization?.previews?.front || 'https://via.placeholder.com/150'
            }
          ],
          basePrice
        };

        item.variant = {
          _id: item.variant,
          price: item.price || basePrice,
          sizes: [item.size],
          colors: [item.color]
        };
      } else {
        // It's a standard/customized DB product item
        if (item.variant && typeof item.variant === 'string' && /^[0-9a-fA-F]{24}$/.test(item.variant)) {
          const resolvedVariant = await ProductVariant.findById(item.variant).lean();
          if (resolvedVariant) {
            item.variant = resolvedVariant;
          }
        }
        
        // If variant not found but product exists, fallback to first variant
        if ((!item.variant || typeof item.variant === 'string') && item.product) {
          const resolvedVariant = await ProductVariant.findOne({ product: item.product._id }).lean();
          if (resolvedVariant) {
            item.variant = resolvedVariant;
          }
        }

        // If customization exists, override product images with customization preview URL so the user sees their design!
        if (customization && item.product) {
          const previewUrl = customization.previewUrl || customization.previews?.mockup || customization.previews?.front;
          if (previewUrl) {
            item.product.images = [{ url: previewUrl }];
          }
        }
      }
    }

    return populated;
  }

  async getOrCreateCart({ userId, sessionId }) {
    const cartDoc = await this.getOrCreateCartDoc({ userId, sessionId });
    return await this.populateCart(cartDoc);
  }

  /**
   * Deep validation of customization properties before cart addition.
   * Seamlessly detours database validation if it detects a frontend template.
   */
  async validateCustomization({ productId, variantId, color, size, customizationId, userId }) {
    // Helper to check if a string is a valid MongoDB 24-character hex ObjectId
    const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id.toString());

    // 1. Resolve the customization doc first
    let customization = null;
    if (customizationId && isValidObjectId(customizationId)) {
      customization = await Customization.findById(customizationId);
      if (!customization) {
        throw new ApiError(404, 'Customization design draft not found', 'CUSTOMIZATION_NOT_FOUND');
      }

      // Ownership check
      if (userId && customization.user && customization.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'Unauthorized access to design customization', 'UNAUTHORIZED_CUSTOMIZATION');
      }
    }

    // 2. Foolproof Frontend Template Detection
    // If explicitly marked as a template, or if the IDs are strings/labels from the frontend rather than ObjectIds, 
    // it's treated as a dynamic customizable asset.
    const isFrontendTemplate = !!(
      customization?.baseTemplateId ||
      customization?.clothingType ||
      (variantId && !isValidObjectId(variantId)) ||
      (productId && !isValidObjectId(productId)) ||
      (!productId && !variantId)
    );

    if (!isFrontendTemplate) {
      // ── DB product path: validate product, variant, color & size ─────────
      const effectiveProductId = productId || customization?.productId;

      // If there is no product ID at all, treat it as a frontend template
      if (!effectiveProductId) {
        return true;
      }

      // Try fetching the product from the database
      const product = await Product.findById(effectiveProductId);

      // CRITICAL FIX: If it's not found in the database, it's a frontend template!
      // Do not crash with PRODUCT_NOT_FOUND or VARIANT_NOT_FOUND. Just return out safely.
      if (!product) {
        logger.info(`Product ${effectiveProductId} not found in DB. Handling as a custom frontend template.`);
        return true;
      }

      // Variant exists and belongs to product
      const variant = await ProductVariant.findById(variantId);
      if (!variant) { logger.info(`Variant ${variantId} not found. Assuming frontend template.`); return true; } else if (variant.product.toString() !== effectiveProductId.toString()) { throw new ApiError(404, 'Product variant not found or mismatch', 'VARIANT_NOT_FOUND'); }

      // Product and variant are active
      if (!product.isActive || !variant.isActive) {
        throw new ApiError(400, 'Product or variant is currently inactive', 'PRODUCT_INACTIVE');
      }

      // Color is valid for the variant
      const colorMatch = variant.colors.some(c => c.value === color || c.name === color);
      if (!colorMatch) {
        throw new ApiError(400, `Selected color ${color} is not valid for this variant`, 'INVALID_COLOR');
      }

      // Size is valid for the variant
      const sizeMatch = variant.sizes.includes(size);
      if (!sizeMatch) {
        throw new ApiError(400, `Selected size ${size} is not valid for this variant`, 'INVALID_SIZE');
      }

      // Validate print areas against DB rules
      if (customization && customization.printAreas && customization.printAreas.length > 0) {
        await customizationService.validateCustomizationInput(
          effectiveProductId,
          customization.printAreas,
          customization.baseTemplateId,
          customization.clothingType
        );
      }
    }
  }


  /**
   * Create a duplicate snapshot of a customization to isolate it from future editor saves
   */
  async duplicateCustomizationSnapshot(customizationId) {
  if (!customizationId) return null;
  const original = await Customization.findById(customizationId);
  if (!original) return null;

  const isFrontendTemplate = !original.product && !!(original.baseTemplateId || original.clothingType);

  const copyDoc = new Customization({
    productId: original.productId,
    variantId: original.variantId,
    selectedColor: original.selectedColor,
    selectedSize: original.selectedSize,
    editableDesignJSON: original.editableDesignJSON,
    previews: original.previews,
    printAreas: original.printAreas,
    productionFiles: original.productionFiles,
    user: original.user,
    variant: original.variant,
    printArea: original.printArea,
    canvasJSON: original.canvasJSON,
    backgroundColor: original.backgroundColor,
    previewUrl: original.previewUrl,
    baseTemplateId: original.baseTemplateId || null,
    clothingType: original.clothingType || null,
    ...(original.product && { product: original.product }),
    ...(original.productId && { productId: original.productId }),
  });

  await copyDoc.save({ validateBeforeSave: !isFrontendTemplate });

  const layers = await Layer.find({ customizationId });
  if (layers && layers.length > 0) {
    const layersCopy = layers.map(layer => {
      const layerObj = layer.toObject();
      delete layerObj._id;
      delete layerObj.createdAt;
      delete layerObj.updatedAt;
      return {
        ...layerObj,
        customizationId: copyDoc._id
      };
    });
    await Layer.insertMany(layersCopy);
  }

  return copyDoc._id;
}

  /**
   * Recalculate cart totals using decoupled pricing engine
   */
  async recalculateCart(cart) {
    let grandTotal = 0;

    for (const item of cart.items) {
      let variant = null;
      let customization = null;

      if (item.customization) {
        customization = await Customization.findById(item.customization);
        if (customization) {
          customization.layers = await Layer.find({ customizationId: item.customization });
        }
      }

      // Check template registry using normalized key evaluation
      const templateKey = customization?.baseTemplateId || customization?.clothingType || item.variant || item.product;
      const matchKey = Object.keys(TEMPLATE_BASE_PRICES).find(
        k => cleanKey(k) === cleanKey(templateKey)
      );

      if (matchKey) {
        // Build an elegant virtual variant layout so pricing calculations survive seamlessly
        const basePrice = TEMPLATE_BASE_PRICES[matchKey];
        variant = {
          price: basePrice,
          basePrice: basePrice,
          product: { name: customization?.clothingType || 'Custom Template Item', price: basePrice }
        };
      } else {
        // Standard database tracking pipeline
        if (item.variant) {
          variant = await ProductVariant.findById(item.variant).populate('product');
        }
        
        // Fallback: if variant is not found but product exists, fallback to first variant
        if (!variant && item.product) {
          variant = await ProductVariant.findOne({ product: item.product }).populate('product');
        }

        // Fallback for non-customizable catalog products without variant documents
        if (!variant && item.product) {
          const productDoc = await Product.findById(item.product);
          if (productDoc) {
            let sizePrice = null;
            if (item.size && Array.isArray(productDoc.sizes)) {
              const matchedSize = productDoc.sizes.find(
                (s) => (typeof s === 'object' ? s.size : s) === item.size
              );
              if (matchedSize && typeof matchedSize === 'object' && matchedSize.price != null && matchedSize.price !== '') {
                const parsed = Number(matchedSize.price);
                if (!isNaN(parsed) && parsed > 0) {
                  sizePrice = parsed;
                }
              }
            }

            const defaultPrice = (productDoc.salePrice && Number(productDoc.salePrice) > 0)
              ? Number(productDoc.salePrice)
              : (productDoc.price || productDoc.basePrice || 0);

            const effectivePrice = sizePrice !== null ? sizePrice : defaultPrice;

            variant = {
              price: effectivePrice,
              basePrice: sizePrice || productDoc.basePrice || effectivePrice,
              product: productDoc
            };
          }
        } else if (variant && variant.product) {
          const productDoc = variant.product;
          if (item.size && Array.isArray(productDoc.sizes)) {
            const matchedSize = productDoc.sizes.find(
              (s) => (typeof s === 'object' ? s.size : s) === item.size
            );
            if (matchedSize && typeof matchedSize === 'object' && matchedSize.price != null && matchedSize.price !== '') {
              const parsed = Number(matchedSize.price);
              if (!isNaN(parsed) && parsed > 0) {
                variant.price = parsed;
              }
            }
          }
        }
      }

      if (!variant) continue;

      const explicitUnitPrice = item.price && !isNaN(Number(item.price)) && Number(item.price) > 0
        ? Number(item.price)
        : null;
      if (explicitUnitPrice !== null) {
        variant.price = explicitUnitPrice;
        if (!variant.basePrice || isNaN(Number(variant.basePrice)) || Number(variant.basePrice) <= 0) {
          variant.basePrice = explicitUnitPrice;
        }
      }

      const itemPricing = pricingService.calculatePrice({
        customization,
        variant,
        quantity: item.quantity
      });

      item.pricing = {
        basePrice: itemPricing.basePrice,
        customizationCost: itemPricing.customizationCost,
        printCost: itemPricing.printAreaCost
      };
      item.price = explicitUnitPrice !== null ? explicitUnitPrice : itemPricing.singleItemTotal;
      grandTotal += itemPricing.subTotal;
    }

    cart.totalAmount = grandTotal;
    await cart.save();
    return await this.populateCart(cart);
  }

  /**
   * Add a customized product item to the shopping cart
   */
  async addCustomizedProduct({ userId, sessionId }, { productId, variantId, customizationId, color, size, price, quantity }) {
  // 1. Perform foundational context validation checks
  await this.validateCustomization({ productId, variantId, color, size, customizationId, userId });

  // Use raw doc so we can call .items.push() / .save()
  const cart = await this.getOrCreateCartDoc({ userId, sessionId });

  // 2. Duplicate customization draft for checkout snapshotting
  const snapshotCustomizationId = await this.duplicateCustomizationSnapshot(customizationId);

  // 3. Locate existing cart match cleanly managing mixed String/ObjectId instances
  const existingIndex = cart.items.findIndex(item =>
    item.variant?.toString() === variantId?.toString() &&
    item.color === color &&
    item.size === size &&
    (!item.customization && !snapshotCustomizationId)
  );

  if (existingIndex > -1 && !snapshotCustomizationId) {
    cart.items[existingIndex].quantity += Number(quantity);
    if (price && Number(price) > 0) {
      cart.items[existingIndex].price = Number(price);
    }
  } else {
    cart.items.push({
      product: productId || null,
      variant: variantId,
      customization: snapshotCustomizationId || null,
      color,
      size,
      quantity: Number(quantity),
      price: price && Number(price) > 0 ? Number(price) : 0
    });
  }

  // 4. Run system balancing and update totals
  return await this.recalculateCart(cart);
}

  /**
   * Update quantity and parameters of a cart item
   */
  async updateCustomizedProduct({ userId, sessionId }, cartItemId, { quantity, color, size }) {
  const cart = await this.getOrCreateCartDoc({ userId, sessionId });
  const item = cart.items.id(cartItemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  if (quantity !== undefined) {
    item.quantity = Number(quantity);
  }

  if (color || size) {
    item.color = color || item.color;
    item.size = size || item.size;

    // Run validations using modern parameters
    await this.validateCustomization({
      productId: item.product,
      variantId: item.variant,
      color: item.color,
      size: item.size,
      customizationId: item.customization,
      userId
    });
  }

  return await this.recalculateCart(cart);
}

  /**
   * Remove item from cart and clean up its duplicated customization snapshots
   */
  async removeCustomizedProduct({ userId, sessionId }, cartItemId) {
  const cart = await this.getOrCreateCartDoc({ userId, sessionId });
  const item = cart.items.id(cartItemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  if (item.customization) {
    await Layer.deleteMany({ customizationId: item.customization });
    await Customization.findByIdAndDelete(item.customization);
  }

  cart.items.pull(cartItemId);
  return await this.recalculateCart(cart);
}

  /**
   * Merge guest cart items into authenticated user cart upon login
   */
  async mergeGuestCart(sessionId, userId) {
  const guestCart = await Cart.findOne({ sessionId });
  if (!guestCart || guestCart.items.length === 0) {
    return await this.getOrCreateCart({ userId }); // returns populated
  }

  const userCart = await this.getOrCreateCartDoc({ userId }); // raw doc for mutation

  for (const guestItem of guestCart.items) {
    try {
      await this.validateCustomization({
        productId: guestItem.product,
        variantId: guestItem.variant,
        color: guestItem.color,
        size: guestItem.size,
        customizationId: guestItem.customization,
        userId
      });

      if (guestItem.customization) {
        await Customization.findByIdAndUpdate(guestItem.customization, { user: userId });
      }

      const existingIndex = userCart.items.findIndex(item =>
        item.variant?.toString() === guestItem.variant?.toString() &&
        item.color === guestItem.color &&
        item.size === guestItem.size &&
        (!item.customization && !guestItem.customization)
      );

      if (existingIndex > -1) {
        userCart.items[existingIndex].quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    } catch (err) {
      console.warn(`Failed merging guest cart item: ${err.message}. Skipping item...`);
      if (guestItem.customization) {
        await Layer.deleteMany({ customizationId: guestItem.customization });
        await Customization.findByIdAndDelete(guestItem.customization);
      }
    }
  }

  await guestCart.deleteOne();
  return await this.recalculateCart(userCart);
}

  /**
   * Clear all items from user cart
   */
  async clearCart({ userId, sessionId }, deleteCustomizations = false) {
    const cart = await this.getOrCreateCartDoc({ userId, sessionId });

    if (deleteCustomizations) {
      for (const item of cart.items) {
        if (item.customization) {
          await Layer.deleteMany({ customizationId: item.customization });
          await Customization.findByIdAndDelete(item.customization);
        }
      }
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    return await this.populateCart(cart);
  }
}

export default new CartService();