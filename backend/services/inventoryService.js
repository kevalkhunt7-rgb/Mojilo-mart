import inventoryRepository from '../repositories/inventoryRepository.js';
import Inventory from '../models/Inventory.js';
import InventoryHistory from '../models/InventoryHistory.js';
import ProductVariant from '../models/ProductVariant.js';
import ApiError from '../utils/ApiError.js';

class InventoryService {
  async restockItems({ variantId, warehouseId, quantity, notes = 'Standard Restocking' }) {
    if (quantity <= 0) {
      throw new ApiError(400, 'Restock quantity must be greater than zero');
    }

    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      throw new ApiError(404, 'Product variant not found');
    }

    let inventory = await Inventory.findOne({ variant: variantId, warehouse: warehouseId });
    if (!inventory) {
      inventory = await Inventory.create({
        variant: variantId,
        warehouse: warehouseId,
        quantity: 0
      });
    }

    inventory.quantity += Number(quantity);
    await inventory.save();

    // Log History
    await InventoryHistory.create({
      inventory: inventory._id,
      variant: variantId,
      quantityChanged: Number(quantity),
      type: 'restock',
      notes
    });

    // Update variant overall stock (sum across all warehouses)
    const stockItems = await Inventory.find({ variant: variantId });
    variant.inventory = stockItems.reduce((sum, item) => sum + item.quantity, 0);
    await variant.save();

    return inventory;
  }

  async getLowStockAlerts() {
    return await inventoryRepository.getLowStockItems();
  }

  async getWarehouseStock(warehouseId) {
    return await Inventory.find({ warehouse: warehouseId }).populate({
      path: 'variant',
      populate: { path: 'product' }
    });
  }
}

export default new InventoryService();
