import Notification from '../models/Notification.js';

class NotificationService {
  async getUserNotifications(userId) {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async createNotification({ userId, title, message, type = 'info' }) {
    return await Notification.create({
      user: userId,
      title,
      message,
      type
    });
  }
}

export default new NotificationService();
