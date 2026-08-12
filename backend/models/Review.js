import mongoose from 'mongoose';

const reviewImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  mimeType: { type: String },
}, { 
  _id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewImageSchema.virtual('secure_url').get(function () {
  return this.url;
});
reviewImageSchema.virtual('public_id').get(function () {
  return this.publicId;
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderItem: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  text: { type: String, trim: true },
  reviewImages: { type: [reviewImageSchema], default: [] },
  verifiedPurchase: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index: user can review a specific product only once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ orderItem: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
