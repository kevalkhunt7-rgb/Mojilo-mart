import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  productVariant: {
    type: String,
    ref: 'ProductVariant',
    required: false,
  },
  customization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
    default: null, // Null if ordering a standard blank product
  },
  productName: {
    type: String,
    required: true, // Snapshot in case product gets renamed
  },
  variantDescription: {
    type: String, // Snapshot e.g. "Size: L / Color: Blue"
  },
  color: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true, // Price paid per item at purchase time
  },
  pricing: {
    basePrice: { type: Number },
    customizationCost: { type: Number, default: 0 },
    printCost: { type: Number, default: 0 },
  },
  productionZipUrl: {
    type: String,
  }
}, {
  timestamps: true,
});

orderItemSchema.index({ order: 1 });

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export default OrderItem;
