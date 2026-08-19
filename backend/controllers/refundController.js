import paymentService from '../services/paymentService.js';
import Refund from '../models/Refund.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const refundPayment = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;
  const result = await paymentService.refundPayment(orderId, amount);
  res.status(200).json(new ApiResponse(200, result, 'Refund processed successfully'));
});

export const getRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find({})
    .populate({
      path: 'order',
      populate: { path: 'user', select: 'name email' }
    })
    .populate('payment')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, refunds, 'Refunds retrieved successfully'));
});

export const updateRefundStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'processed', 'failed'].includes(status)) {
    throw new ApiError(400, 'Invalid refund status');
  }

  const refund = await Refund.findByIdAndUpdate(id, { status }, { new: true });
  if (!refund) {
    throw new ApiError(404, 'Refund request not found');
  }

  res.status(200).json(new ApiResponse(200, refund, `Refund status updated to ${status}`));
});

export const syncRefundStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const refund = await paymentService.syncRefundStatus(id);
  res.status(200).json(new ApiResponse(200, refund, `Refund status synced via Razorpay API/Webhook (${refund.status})`));
});

export const handleWebhook = asyncHandler(async (req, res) => {
  const event = req.body?.event;
  const payload = req.body?.payload || {};
  const result = await paymentService.handleRazorpayWebhook(event, payload);
  res.status(200).json(new ApiResponse(200, result, 'Webhook processed successfully'));
});

