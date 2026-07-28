import { Server } from 'socket.io';
import logger from '../utils/logger.js';

let ioInstance = null;

// Map of userId -> socketIds for sending direct notifications
const userSockets = new Map();

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join user channel
    socket.on('join_user', (userId) => {
      if (userId) {
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        socket.join(`user_${userId}`);
        logger.info(`User ${userId} joined their personal socket channel.`);
      }
    });

    // Join admin channel
    socket.on('join_admin', () => {
      socket.join('admin_dashboard');
      logger.info('Admin client joined the live stats socket channel.');
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
      
      // Clean up maps
      for (const [userId, socketSet] of userSockets.entries()) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id);
          if (socketSet.size === 0) {
            userSockets.delete(userId);
          }
          break;
        }
      }
    });
  });

  return ioInstance;
};

/**
 * Emits order status updates to the specific customer
 */
export const emitOrderStatusUpdate = (userId, orderId, status) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('order_status_updated', { orderId, status });
    logger.info(`Emitted order_status_updated to user_${userId}`);
  }
};

/**
 * Emits direct notification alert to the specific customer
 */
export const emitNotification = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit('new_notification', notification);
    logger.info(`Emitted new_notification to user_${userId}`);
  }
};

/**
 * Emits live order placement metrics to the admin dashboard
 */
export const emitDashboardLiveUpdate = (metricType, data) => {
  if (ioInstance) {
    ioInstance.to('admin_dashboard').emit('dashboard_live_update', { metricType, data });
    logger.info(`Emitted dashboard_live_update metric '${metricType}' to admin channel`);
  }
};
