import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import CustomCart from '../models/customCart.js';
import cartService from './cartService.js';
import customCartService from './customCartService.js';
import orderService from './orderService.js';
import couponService from './couponService.js';
import Setting from '../models/Setting.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { enqueuePrintGeneration } from './printQueueService.js';

class PaymentService {
  async createRazorpayOrder(userId, payload = {}) {
    const { orderId, amount, couponCode } = typeof payload === 'object' && payload !== null ? payload : { amount: payload };
    let finalAmount = Number(amount) || 0;

    // If amount is not passed directly, calculate from user's active cart
    if (!finalAmount || finalAmount <= 0) {
      const [cart, customCart] = await Promise.all([
        Cart.findOne({ user: userId }).populate('items.product items.variant'),
        CustomCart.findOne({ user: userId })
      ]);

      let subTotal = 0;
      if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
        subTotal += cart.items.reduce((sum, item) => {
          const p = item.price || item.product?.salePrice || item.product?.price || item.product?.basePrice || 0;
          return sum + (Number(p) * (item.quantity || 1));
        }, 0);
      }
      if (customCart && Array.isArray(customCart.items) && customCart.items.length > 0) {
        subTotal += customCart.items.reduce((sum, item) => sum + (Number(item.totalItemPrice) || 0), 0);
      }

      let discountAmount = 0;
      if (couponCode) {
        try {
          const valCoupon = await couponService.validateCoupon(couponCode, subTotal);
          discountAmount = valCoupon.discountAmount || 0;
        } catch (err) {
          logger.warn(`[PaymentService] Coupon validation warning during Razorpay order creation: ${err.message}`);
        }
      }

      const setting = await Setting.findOne();
      const shippingEnabled = setting?.shippingEnabled !== false;
      const freeThreshold = setting?.freeShippingThreshold !== undefined ? Number(setting.freeShippingThreshold) : 999;
      const defaultFee = setting?.defaultShippingCharge !== undefined ? Number(setting.defaultShippingCharge) : 50;

      const shippingCharge = (shippingEnabled && subTotal < freeThreshold) ? defaultFee : 0;

      finalAmount = Math.max(0, Math.round((subTotal - discountAmount + shippingCharge) * 100) / 100);
    }

    if (!finalAmount || finalAmount <= 0) {
      throw new ApiError(400, 'Shopping cart is empty or payment amount is invalid');
    }

    const amountInPaise = Math.round(finalAmount * 100);

    try {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderId ? `receipt_order_${orderId}` : `receipt_chk_${userId}_${Date.now()}`,
        payment_capture: 1
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      if (orderId) {
        await Payment.create({
          order: orderId,
          razorpayOrderId: razorpayOrder.id,
          amount: finalAmount,
          status: 'pending'
        });
      }

      const keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : 'rzp_test_mockkey';
      if (keyId.startsWith('rzp_test') || razorpayOrder.id.startsWith('order_mock_')) {
        logger.warn(`[Razorpay] Order ${razorpayOrder.id} created in TEST/MOCK mode.`);
      } else {
        logger.info(`[Razorpay] Order ${razorpayOrder.id} created in LIVE mode.`);
      }

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: keyId
      };
    } catch (error) {
      logger.error('Razorpay Order Creation Error:', error);
      throw new ApiError(500, `Razorpay error: ${error.message}`);
    }
  }

  async verifyPaymentSignature(userId, payload = {}) {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shippingAddress,
      billingAddress,
      couponCode,
      shippingMethodId
    } = payload;

    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const secret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : 'your_secret';

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    const isMock = razorpayOrderId?.startsWith('order_mock_') || !process.env.RAZORPAY_KEY_SECRET;
    const isValid = isMock || (generatedSignature === razorpaySignature);

    if (!isValid) {
      if (orderId) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          { status: 'failed', razorpayPaymentId, razorpaySignature }
        );
      }
      throw new ApiError(400, 'Payment signature verification failed');
    }

    let order = null;
    let invoiceNumber = null;

    if (orderId) {
      // Legacy flow: update pre-created order
      order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          notes: `Online payment successfully captured via Razorpay. Reference: ${razorpayPaymentId}.`,
          updatedBy: 'system'
        });
        await order.save();
      }
    } else {
      // Production pay-first flow: Place and confirm order in DB ONLY NOW after verified payment!
      const placeResult = await orderService.placeOrder(userId, {
        paymentMethod: 'Online',
        couponCode,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        shippingMethodId,
        initialPaymentStatus: 'paid',
        initialOrderStatus: 'confirmed'
      });
      order = placeResult.order;
      invoiceNumber = placeResult.invoiceNumber;
    }

    if (!order) {
      throw new ApiError(404, 'Failed to place or confirm order after payment verification');
    }

    // Record or update payment as captured
    let payment = await Payment.findOne({ razorpayOrderId });
    if (payment) {
      payment.status = 'captured';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.order = order._id;
      await payment.save();
    } else {
      payment = await Payment.create({
        order: order._id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: order.totalAmount,
        status: 'captured'
      });
    }

    // Trigger print rendering background job
    try {
      await enqueuePrintGeneration(order._id);
    } catch (err) {
      logger.error(`Failed to enqueue print files generation for online Order ${order._id}:`, err);
    }

    // Clear the user's cart upon successful checkout payment confirmation
    try {
      await cartService.clearCart({ userId: order.user }, false);
      await customCartService.clearCart({ userId: order.user }, false);
    } catch (err) {
      logger.error(`Failed to clear cart for user ${order.user} after payment verification:`, err);
    }

    // Send order confirmation email
    orderService.sendConfirmationEmailAsync(order.user, order);

    return {
      payment,
      order,
      invoiceNumber
    };
  }

  async refundPayment(orderId, amount) {
    const payment = await Payment.findOne({ order: orderId, status: 'captured' });
    if (!payment) {
      throw new ApiError(404, 'Captured payment record not found for this order');
    }

    try {
      const amountInPaise = Math.round(amount * 100);
      const refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
        amount: amountInPaise,
        speed: 'normal'
      });

      const refundRecord = await Refund.create({
        payment: payment._id,
        order: orderId,
        razorpayRefundId: refund.id,
        amount: amount,
        status: 'processed'
      });

      // Update payment status
      payment.status = 'refunded';
      await payment.save();

      // Update Order Status
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'refunded';
        order.orderStatus = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          notes: `Order refunded. Refund Reference: ${refund.id}.`,
          updatedBy: 'system'
        });
        await order.save();
      }

      return refundRecord;
    } catch (error) {
      logger.error('Razorpay Refund Error:', error);
      throw new ApiError(500, `Razorpay refund failed: ${error.message}`);
    }
  }

  async syncRefundStatus(refundId) {
    const refundRecord = await Refund.findById(refundId).populate('order').populate('payment');
    if (!refundRecord) {
      throw new ApiError(404, 'Refund record not found');
    }

    const rzpRefundId = refundRecord.razorpayRefundId;
    let syncedStatus = refundRecord.status;

    if (rzpRefundId && !rzpRefundId.startsWith('rfnd_mock_')) {
      try {
        const rzpResponse = await razorpayInstance.refunds.fetch(rzpRefundId);
        if (rzpResponse && rzpResponse.status) {
          const rzpStatus = rzpResponse.status.toLowerCase();
          if (rzpStatus === 'processed') syncedStatus = 'processed';
          else if (rzpStatus === 'pending') syncedStatus = 'pending';
          else if (rzpStatus === 'failed') syncedStatus = 'failed';
        }
      } catch (err) {
        logger.warn(`[syncRefundStatus] Could not fetch refund ${rzpRefundId} from Razorpay: ${err.message}`);
      }
    }

    refundRecord.status = syncedStatus;
    await refundRecord.save();

    if (syncedStatus === 'processed' && refundRecord.order) {
      const orderId = refundRecord.order._id || refundRecord.order;
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== 'refunded') {
        order.paymentStatus = 'refunded';
        order.orderStatus = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          notes: `Order refund status synced via Razorpay Webhook/API. Refund ID: ${rzpRefundId || 'N/A'}.`,
          updatedBy: 'system'
        });
        await order.save();
      }
    }

    return refundRecord;
  }

  async handleRazorpayWebhook(event, payload = {}) {
    logger.info(`[Razorpay Webhook Received] Event: ${event}`);

    if (event === 'refund.processed' || event === 'refund.failed' || event === 'refund.created') {
      const entity = payload.refund?.entity || payload.payment?.entity || {};
      const rzpRefundId = entity.id || entity.refund_id;
      const rzpStatus = entity.status || (event === 'refund.processed' ? 'processed' : event === 'refund.failed' ? 'failed' : 'pending');

      if (rzpRefundId) {
        const refundRecord = await Refund.findOne({ razorpayRefundId: rzpRefundId });
        if (refundRecord) {
          refundRecord.status = rzpStatus;
          await refundRecord.save();

          if (rzpStatus === 'processed' && refundRecord.order) {
            const order = await Order.findById(refundRecord.order);
            if (order) {
              order.paymentStatus = 'refunded';
              order.orderStatus = 'refunded';
              order.statusHistory.push({
                status: 'refunded',
                notes: `Razorpay Webhook: Refund ${rzpRefundId} status updated to ${rzpStatus}.`,
                updatedBy: 'system'
              });
              await order.save();
            }
          }
        }
      }
    }

    return { received: true };
  }
}

export default new PaymentService();
