import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null indicates system/admin notifications
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'order_update', 'stock_alert', 'promotion', 'system'],
    default: 'info',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  sku: {
    type: String,
    default: null,
  }
}, {
  timestamps: true,
});

notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1, sku: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
