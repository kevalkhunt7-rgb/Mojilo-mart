import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';

class WishlistService {
  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    return wishlist;
  }

  async addToWishlist(userId, productId) {
    const wishlist = await this.getWishlist(userId);
    
    if (wishlist.products.includes(productId)) {
      throw new ApiError(400, 'Product is already in your wishlist');
    }

    wishlist.products.push(productId);
    await wishlist.save();
    return wishlist;
  }

  async removeFromWishlist(userId, productId) {
    const wishlist = await this.getWishlist(userId);
    wishlist.products.pull(productId);
    await wishlist.save();
    return wishlist;
  }
}

export default new WishlistService();
