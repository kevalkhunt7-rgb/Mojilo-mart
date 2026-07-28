import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  razorpayRefundId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending',
  }
}, {
  timestamps: true,
});

refundSchema.index({ payment: 1 });
refundSchema.index({ order: 1 });

const Refund = mongoose.model('Refund', refundSchema);

export default Refund;
