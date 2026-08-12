import mongoose from 'mongoose';

const addressSnapshotSchema = new mongoose.Schema({
  name: String,
  street: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  phone: String,
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  shippingAddress: addressSnapshotSchema,
  billingAddress: addressSnapshotSchema,
  shippingMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingMethod',
  },
  shippingCharges: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Online'],
    default: 'Online',
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'artwork_review',
      'approved',
      'printing',
      'quality_check',
      'packed',
      'shipped',
      'delivered',
      'cancellation_requested',
      'cancelled',
      'refunded'
    ],
    default: 'pending',
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null,
  },
  giftCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GiftCard',
    default: null,
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  pricingSummary: {
    subtotal: { type: Number },
    printingCost: { type: Number, default: 0 },
    customizationCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number }
  },
  statusHistory: [{
    status: { type: String },
    changedAt: { type: Date, default: Date.now },
    notes: { type: String },
    updatedBy: { type: String }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1, createdAt: -1 });

orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order',
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
