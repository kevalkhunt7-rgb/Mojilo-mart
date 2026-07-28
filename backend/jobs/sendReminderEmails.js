import Cart from '../models/Cart.js';
import sendEmail from '../utils/sendEmail.js';
import logger from '../utils/logger.js';

export const sendCartReminders = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find user carts with items that haven't been updated for 24-48 hours
    const carts = await Cart.find({
      user: { $ne: null },
      items: { $not: { $size: 0 } },
      updatedAt: { $gte: fortyEightHoursAgo, $lte: twentyFourHoursAgo }
    }).populate('user');

    for (const cart of carts) {
      if (cart.user && cart.user.email) {
        await sendEmail({
          email: cart.user.email,
          subject: 'Did you leave something behind?',
          message: `Hi ${cart.user.name}, you left items in your Mojilo shopping cart! Return now to complete your order.`,
          html: `<p>Hi ${cart.user.name},</p><p>You left custom print items in your shopping cart! Return now to complete your order before they go out of stock.</p>`
        });
      }
    }

    logger.info(`[JOB] Dispatched cart reminders to ${carts.length} users.`);
  } catch (error) {
    logger.error('[JOB ERROR] Failed to send cart reminders:', error);
  }
};

export const startReminderJob = () => {
  // Run once every 12 hours
  setInterval(sendCartReminders, 12 * 60 * 60 * 1000);
  logger.info('[JOB REGISTER] Cart reminder job scheduled to run every 12 hours.');
};
