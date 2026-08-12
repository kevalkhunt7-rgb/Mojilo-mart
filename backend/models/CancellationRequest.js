import mongoose from 'mongoose';

const cancellationRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  refund: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Refund',
  },
  previousOrderStatus: {
    type: String,
    default: 'confirmed',
  }
}, {
  timestamps: true,
});

cancellationRequestSchema.index({ order: 1 });
cancellationRequestSchema.index({ user: 1 });
cancellationRequestSchema.index({ status: 1, createdAt: -1 });

const CancellationRequest = mongoose.model('CancellationRequest', cancellationRequestSchema);

export default CancellationRequest;
