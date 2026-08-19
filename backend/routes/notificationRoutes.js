import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  deleteNotification
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/', clearNotifications);
router.delete('/:id', deleteNotification);

export default router;
