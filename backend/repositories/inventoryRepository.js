import BaseRepository from './baseRepository.js';
import Inventory from '../models/Inventory.js';
import ProductVariant from '../models/ProductVariant.js';

class InventoryRepository extends BaseRepository {
  constructor() {
    super(Inventory);
  }

  async checkStock(variant, quantity) {
    if (!variant) return true;

    // Handle both populated variant object and raw ObjectId string/ID
    const variantId = typeof variant === 'object' ? (variant._id || variant.id) : variant;
    if (!variantId) return true;

    // 1. Check warehouse Inventory collection first
    const stockItems = await Inventory.find({ variant: variantId });
    if (stockItems.length > 0) {
      const totalAvailable = stockItems.reduce((sum, item) => sum + item.quantity, 0);
      return totalAvailable >= quantity;
    }

    // 2. Fallback: Check direct inventory field on ProductVariant model
    if (typeof variant === 'object' && typeof variant.inventory === 'number') {
      return variant.inventory >= quantity;
    }

    const dbVariant = await ProductVariant.findById(variantId);
    if (dbVariant && typeof dbVariant.inventory === 'number') {
      return dbVariant.inventory >= quantity;
    }

    // Default to true if no inventory constraint is defined
    return true;
  }

  async deductStock(variant, quantity) {
    if (!variant) return true;

    const variantId = typeof variant === 'object' ? (variant._id || variant.id) : variant;
    if (!variantId) return true;

    // 1. Find active stock in warehouses and deduct
    const stockItems = await Inventory.find({ variant: variantId, quantity: { $gt: 0 } }).sort({ quantity: -1 });
    if (stockItems.length > 0) {
      let remainingToDeduct = quantity;

      for (const stock of stockItems) {
        if (remainingToDeduct <= 0) break;
        
        if (stock.quantity >= remainingToDeduct) {
          stock.quantity -= remainingToDeduct;
          remainingToDeduct = 0;
          await stock.save();
        } else {
          remainingToDeduct -= stock.quantity;
          stock.quantity = 0;
          await stock.save();
        }
      }

      return remainingToDeduct === 0;
    }

    // 2. Fallback: Deduct from ProductVariant.inventory directly
    const dbVariant = await ProductVariant.findById(variantId);
    if (dbVariant && typeof dbVariant.inventory === 'number') {
      dbVariant.inventory = Math.max(0, dbVariant.inventory - quantity);
      await dbVariant.save();
    }

    return true;
  }

  async restoreStock(variant, quantity) {
    if (!variant || quantity <= 0) return true;

    const variantId = typeof variant === 'object' ? (variant._id || variant.id) : variant;
    if (!variantId) return true;

    const stockItems = await Inventory.find({ variant: variantId }).sort({ quantity: 1 });
    if (stockItems.length > 0) {
      stockItems[0].quantity += quantity;
      await stockItems[0].save();
      return true;
    }

    const dbVariant = await ProductVariant.findById(variantId);
    if (dbVariant && typeof dbVariant.inventory === 'number') {
      dbVariant.inventory += quantity;
      await dbVariant.save();
    }

    return true;
  }

  async getLowStockItems() {
    return await Inventory.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).populate({
      path: 'variant',
      populate: { path: 'product' }
    }).populate('warehouse');
  }
}

export default new InventoryRepository();
