import mongoose from 'mongoose';

const orderStatusHistorySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'printing',
      'packed',
      'shipped',
      'delivered',
      'cancelled',

    ],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // System-triggered or specific user
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true,
});

orderStatusHistorySchema.index({ order: 1 });

const OrderStatusHistory = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);

export default OrderStatusHistory;
