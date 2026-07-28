import mongoose from 'mongoose';

const customCartItemSchema = new mongoose.Schema({
  customizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customization',
    required: true,
  },
  clothingType: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  virtualBasePrice: {
    type: Number,
    required: true,
  },
  totalItemPrice: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

const customCartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  sessionId: {
    type: String,
    default: null,
  },
  items: [customCartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

customCartSchema.index({ user: 1 });
customCartSchema.index({ sessionId: 1 });

const CustomCart = mongoose.model('CustomCart', customCartSchema);

export default CustomCart;
