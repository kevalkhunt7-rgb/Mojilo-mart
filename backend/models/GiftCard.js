import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  initialBalance: {
    type: Number,
    required: true,
    min: 0,
  },
  currentBalance: {
    type: Number,
    required: true,
    min: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

giftCardSchema.index({ code: 1 });

const GiftCard = mongoose.model('GiftCard', giftCardSchema);

export default GiftCard;
