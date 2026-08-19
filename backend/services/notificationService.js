import Notification from '../models/Notification.js';

class NotificationService {
  async getAdminNotifications() {
    return await Notification.find({}).sort({ createdAt: -1 }).limit(50);
  }

  async getUserNotifications(userId) {
    return await Notification.find({
      $or: [{ user: userId }, { user: null }]
    }).sort({ createdAt: -1 }).limit(50);
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead() {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async clearAll() {
    await Notification.deleteMany({});
    return { message: 'All notifications cleared' };
  }

  async deleteNotification(notificationId) {
    await Notification.findByIdAndDelete(notificationId);
    return { message: 'Notification deleted' };
  }

  async createNotification({ userId = null, title, message, type = 'info', link = null, sku = null }) {
    try {
      return await Notification.create({
        user: userId,
        title,
        message,
        type,
        link,
        sku
      });
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  }
}

export default new NotificationService();
