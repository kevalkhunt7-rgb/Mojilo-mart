import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: 0, // 0 means no limit for flat, or specific cap for percentage
  },
  expiresAt: {
    type: Date,
    required: false,
    default: null,
  },
  usageLimit: {
    type: Number,
    default: 0, // 0 means unlimited usage
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

couponSchema.index({ code: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
