import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true,
  },
  images: [{
    type: String // URLs of customer-submitted photos
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1, product: 1 }, { unique: true }); // A user can review a product only once

const Review = mongoose.model('Review', reviewSchema);

export default Review;
