import mongoose from 'mongoose';

const inventoryHistorySchema = new mongoose.Schema({
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true,
  },
  quantityChanged: {
    type: Number,
    required: true, // e.g. +50 for restock, -2 for sale
  },
  type: {
    type: String,
    enum: ['restock', 'sale', 'adjustment', 'transfer', 'return'],
    required: true,
  },
  referenceId: {
    type: String, // can store Order ID, PO number, etc.
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true,
});

inventoryHistorySchema.index({ inventory: 1 });
inventoryHistorySchema.index({ variant: 1 });

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);

export default InventoryHistory;
