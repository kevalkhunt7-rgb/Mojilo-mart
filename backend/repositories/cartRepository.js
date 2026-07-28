import BaseRepository from './baseRepository.js';
import Cart from '../models/Cart.js';

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findByUserId(userId) {
    return await Cart.findOne({ user: userId }).populate('items.product items.variant items.customization');
  }

  async findBySessionId(sessionId) {
    return await Cart.findOne({ sessionId }).populate('items.product items.variant items.customization');
  }

  async mergeCarts(guestCart, userCart, userId) {
    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      return userCart;
    }

    if (!userCart) {
      // If user has no cart, assign guest cart to user
      guestCart.user = userId;
      guestCart.sessionId = null;
      await guestCart.save();
      return guestCart;
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      const existingItemIndex = userCart.items.findIndex(item => 
        item.variant.toString() === guestItem.variant.toString() &&
        (item.customization ? item.customization.toString() : null) === (guestItem.customization ? guestItem.customization.toString() : null)
      );

      if (existingItemIndex > -1) {
        // Update quantity
        userCart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        userCart.items.push(guestItem);
      }
    }

    // Update totals
    userCart.totalAmount = userCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    await userCart.save();

    // Delete guest cart
    await Cart.findByIdAndDelete(guestCart._id);

    return userCart;
  }
}

export default new CartRepository();
