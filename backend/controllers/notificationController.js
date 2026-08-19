import notificationService from '../services/notificationService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = req.user?.role === 'admin'
    ? await notificationService.getAdminNotifications()
    : await notificationService.getUserNotifications(req.user._id);
  res.status(200).json(new ApiResponse(200, notifications, 'Notifications retrieved'));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id);
  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead();
  res.status(200).json(new ApiResponse(200, result, 'All notifications marked as read'));
});

export const clearNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.clearAll();
  res.status(200).json(new ApiResponse(200, result, 'All notifications cleared'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id);
  res.status(200).json(new ApiResponse(200, result, 'Notification deleted'));
});
