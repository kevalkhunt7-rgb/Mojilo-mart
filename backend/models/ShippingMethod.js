import mongoose from 'mongoose';

const shippingMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true, // e.g. Standard, Express, Free
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0, // Min total amount in order to qualify for this shipping rate
  },
  deliveryTimeEstimated: {
    type: String,
    required: true, // e.g. "3-5 business days"
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

const ShippingMethod = mongoose.model('ShippingMethod', shippingMethodSchema);

export default ShippingMethod;
