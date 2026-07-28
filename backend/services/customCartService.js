import CustomCart from '../models/customCart.js';
import Customization from '../models/Customization.js';
import Layer from '../models/Layer.js';
import pricingService from './pricingService.js';
import ApiError from '../utils/ApiError.js';

const TEMPLATE_BASE_PRICES = {
  'half_sleeve_t_shirt': 19.99,
  'long_sleeve_t_shirt': 24.99,
  'oversized_t_shirt': 22.99,
  'hoodie': 39.99,
  'sports_jersey': 29.99
};

const cleanKey = (str) => String(str || '').toLowerCase().replace(/[\s_-]/g, '');

class CustomCartService {
  /**
   * Helper utility to normalize tracking keys and match TEMPLATE_BASE_PRICES
   */
  getTemplatePrice(clothingType) {
    const cleaned = cleanKey(clothingType);
    const matchKey = Object.keys(TEMPLATE_BASE_PRICES).find(
      k => cleanKey(k) === cleaned
    );
    if (!matchKey) {
      // Default fallback
      return 19.99;
    }
    return TEMPLATE_BASE_PRICES[matchKey];
  }

  /**
   * Retrieve active custom cart or create a new one
   */
  async getOrCreateCartDoc({ userId, sessionId }) {
    let cart = null;
    if (userId) {
      cart = await CustomCart.findOne({ user: userId });
      if (!cart) {
        cart = await CustomCart.create({ user: userId, items: [], totalAmount: 0 });
      }
    } else if (sessionId) {
      cart = await CustomCart.findOne({ sessionId });
      if (!cart) {
        cart = await CustomCart.create({ sessionId, items: [], totalAmount: 0 });
      }
    } else {
      throw new ApiError(400, 'Either User ID or Session ID is required to retrieve the custom cart');
    }
    return cart;
  }

  /**
   * Populates customization data for custom cart items
   */
  async populateCustomCart(cartDoc) {
    if (!cartDoc) return null;
    const populated = await CustomCart.findById(cartDoc._id)
      .populate({ path: 'items.customizationId' })
      .lean({ virtuals: true });
    
    if (!populated) return cartDoc.toObject ? cartDoc.toObject() : cartDoc;
    return populated;
  }

  async getOrCreateCart({ userId, sessionId }) {
    const cartDoc = await this.getOrCreateCartDoc({ userId, sessionId });
    return await this.populateCustomCart(cartDoc);
  }

  /**
   * Add custom template product to Custom Cart
   */
  async addCustomTemplateToCart({ userId, sessionId }, { customizationId, clothingType, size, color, quantity }) {
    // 1. Fetch and validate Customization document
    const customization = await Customization.findById(customizationId);
    if (!customization) {
      throw new ApiError(404, 'Customization design draft not found');
    }

    const cart = await this.getOrCreateCartDoc({ userId, sessionId });

    // 2. See if identical customized item is already in custom cart
    const existingIndex = cart.items.findIndex(item =>
      item.customizationId.toString() === customizationId.toString() &&
      item.clothingType === clothingType &&
      item.size === size &&
      item.color === color
    );

    const basePrice = this.getTemplatePrice(clothingType);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        customizationId,
        clothingType,
        size,
        color,
        quantity: Number(quantity),
        virtualBasePrice: basePrice,
        totalItemPrice: basePrice * Number(quantity) // Temporary, recalculated below
      });
    }

    return await this.recalculateCustomCart(cart);
  }

  /**
   * Update quantity of custom cart item
   */
  async updateQuantity({ userId, sessionId }, cartItemId, quantity) {
    const cart = await this.getOrCreateCartDoc({ userId, sessionId });
    const item = cart.items.id(cartItemId);
    if (!item) {
      throw new ApiError(404, 'Custom cart item not found');
    }

    item.quantity = Number(quantity);
    return await this.recalculateCustomCart(cart);
  }

  /**
   * Remove item from custom cart
   */
  async removeFromCart({ userId, sessionId }, cartItemId) {
    const cart = await this.getOrCreateCartDoc({ userId, sessionId });
    const item = cart.items.id(cartItemId);
    if (!item) {
      throw new ApiError(404, 'Custom cart item not found');
    }

    cart.items.pull(cartItemId);
    return await this.recalculateCustomCart(cart);
  }

  /**
   * Recalculate Custom Cart totals
   */
  async recalculateCustomCart(cart) {
    let grandTotal = 0;

    for (const item of cart.items) {
      const customization = await Customization.findById(item.customizationId);
      if (customization) {
        customization.layers = await Layer.find({ customizationId: item.customizationId });
      }

      const basePrice = this.getTemplatePrice(item.clothingType);
      
      const variant = {
        price: basePrice,
        product: {
          basePrice: basePrice
        }
      };

      const pricing = pricingService.calculatePrice({
        customization,
        variant,
        quantity: item.quantity
      });

      item.virtualBasePrice = basePrice;
      item.totalItemPrice = pricing.subTotal;
      grandTotal += pricing.subTotal;
    }

    cart.totalAmount = grandTotal;
    await cart.save();
    return await this.populateCustomCart(cart);
  }

  /**
   * Clear all items from user's custom cart
   */
  async clearCart({ userId, sessionId }, deleteCustomizations = false) {
    const cart = await this.getOrCreateCartDoc({ userId, sessionId });

    if (deleteCustomizations) {
      for (const item of cart.items) {
        if (item.customizationId) {
          await Layer.deleteMany({ customizationId: item.customizationId });
          await Customization.findByIdAndDelete(item.customizationId);
        }
      }
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    return await this.populateCustomCart(cart);
  }
}

export default new CustomCartService();
