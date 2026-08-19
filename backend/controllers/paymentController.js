import paymentService from '../services/paymentService.js';
import Payment from '../models/Payment.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.createRazorpayOrder(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, result, 'Razorpay order created successfully'));
});

export const verifyPaymentSignature = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPaymentSignature(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, result, 'Payment signature verified and order placed successfully'));
});

export const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate({
      path: 'order',
      populate: { path: 'user', select: 'name email' }
    })
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, payments, 'Payments retrieved successfully'));
});

