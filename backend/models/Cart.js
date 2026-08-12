import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    // optional for frontend template items
    required: false,
  },
  variant: {
    type: String,
    ref: 'ProductVariant',
    // optional for frontend template items
    required: false,
  },
  customization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
    default: null, // Null if standard non-customized variant
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  price: {
    type: Number, // Snapshot of item unit price at addition
    required: true,
  },
  color: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  pricing: {
    basePrice: { type: Number },
    customizationCost: { type: Number, default: 0 },
    printCost: { type: Number, default: 0 },
  }
}, {
  timestamps: true,
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null for guest sessions
  },
  sessionId: {
    type: String, // Guest session mapping ID
    default: null,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ user: 1, updatedAt: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
