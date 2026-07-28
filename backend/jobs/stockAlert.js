import inventoryRepository from '../repositories/inventoryRepository.js';
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

export const checkLowStocks = async () => {
  try {
    const lowStockItems = await inventoryRepository.getLowStockItems();
    
    for (const stock of lowStockItems) {
      const prodName = stock.variant?.product?.name || 'Unknown garment';
      const variantSku = stock.variant?.sku || 'N/A';
      const whName = stock.warehouse?.name || 'Main Warehouse';


      const alreadyNotified = await Notification.findOne({
        title: 'Low Stock Alert',
        message: { $regex: variantSku },
        isRead: false
      });

      if (!alreadyNotified) {
        await Notification.create({
          user: null, // Admin alert
          title: 'Low Stock Alert',
          message: `Product '${prodName}' (SKU: ${variantSku}) in ${whName} has only ${stock.quantity} items left (Threshold: ${stock.lowStockThreshold}).`,
          type: 'stock_alert'
        });
      }
    }

    logger.info(`[JOB] Stock alert scan completed. Notified of ${lowStockItems.length} low stock conditions.`);
  } catch (error) {
    logger.error('[JOB ERROR] Stock alert scan failed:', error);
  }
};

export const startStockAlertJob = () => {
  // Run once every 6 hours
  setInterval(checkLowStocks, 6 * 60 * 60 * 1000);
  logger.info('[JOB REGISTER] Low stock alerting job scheduled to run every 6 hours.');
};
