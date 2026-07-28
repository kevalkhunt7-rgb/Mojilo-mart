import Cart from '../models/Cart.js';
import logger from '../utils/logger.js';

export const cleanAbandonedGuestCarts = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Find guest carts (user is null) and updated before 30 days ago
    const result = await Cart.deleteMany({
      user: null,
      updatedAt: { $lt: thirtyDaysAgo }
    });

    logger.info(`[JOB] Pruned ${result.deletedCount} inactive guest shopping carts.`);
  } catch (error) {
    logger.error('[JOB ERROR] Failed to delete abandoned guest carts:', error);
  }
};

export const startAbandonedCartPruningJob = () => {
  // Run once every 24 hours
  setInterval(cleanAbandonedGuestCarts, 24 * 60 * 60 * 1000);
  logger.info('[JOB REGISTER] Abandoned cart pruning job scheduled to run daily.');
};
