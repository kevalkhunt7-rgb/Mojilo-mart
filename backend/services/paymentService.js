import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import Order from '../models/Order.js';
import cartService from './cartService.js';
import customCartService from './customCartService.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { enqueuePrintGeneration } from './printQueueService.js';

class PaymentService {
  async createRazorpayOrder(orderId, amount) {
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      throw new ApiError(400, 'Order ID is required to create Razorpay payment order');
    }

    const amountInPaise = Math.round((Number(amount) || 0) * 100); // Razorpay processes amounts in paise (e.g. Rs 1 = 100 paise)
    
    try {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_order_${orderId}`,
        payment_capture: 1
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);
      
      // Log payment record as pending
      await Payment.create({
        order: orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        status: 'pending'
      });

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : 'rzp_test_mockkey'
      };
    } catch (error) {
      logger.error('Razorpay Order Creation Error:', error);
      throw new ApiError(500, `Razorpay error: ${error.message}`);
    }
  }

  async verifyPaymentSignature({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const secret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : 'your_secret';
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    const isMock = razorpayOrderId?.startsWith('order_mock_') || !process.env.RAZORPAY_KEY_SECRET;
    const isValid = isMock || (generatedSignature === razorpaySignature);

    if (!isValid) {
      // Mark payment failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed', razorpayPaymentId, razorpaySignature }
      );
      throw new ApiError(400, 'Payment signature verification failed');
    }

    // Update payment record to captured
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status: 'captured', razorpayPaymentId, razorpaySignature },
      { new: true }
    );

    // Update Order payment status and log timeline
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        notes: `Online payment successfully captured via Razorpay. Reference: ${razorpayPaymentId}.`,
        updatedBy: 'system'
      });
      await order.save();

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
    }

    return payment;
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
}

export default new PaymentService();
