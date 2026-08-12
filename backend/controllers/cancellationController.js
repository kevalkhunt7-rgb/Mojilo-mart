import CancellationRequest from '../models/CancellationRequest.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import paymentService from '../services/paymentService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

// Customer: Submit a cancellation request for an order
export const requestCancellation = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;

  if (!orderId) {
    throw new ApiError(400, 'Order ID is required');
  }
  if (!reason || !reason.trim()) {
    throw new ApiError(400, 'Please provide a valid reason for cancellation');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Ensure order belongs to requesting user
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Unauthorized to request cancellation for this order');
  }

  // Non-cancellable statuses
  const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
  if (nonCancellableStatuses.includes(order.orderStatus)) {
    throw new ApiError(400, `Order cannot be cancelled because it is already ${order.orderStatus}`);
  }

  // Check if active pending request already exists
  const existingRequest = await CancellationRequest.findOne({
    order: order._id,
    status: 'pending'
  });
  if (existingRequest) {
    throw new ApiError(400, 'A cancellation request for this order is already pending admin review');
  }

  const previousOrderStatus = order.orderStatus || 'confirmed';

  const cancellationRequest = await CancellationRequest.create({
    order: order._id,
    user: req.user._id,
    reason: reason.trim(),
    previousOrderStatus,
    status: 'pending'
  });

  // Update order status to cancellation_requested
  order.orderStatus = 'cancellation_requested';
  order.statusHistory.push({
    status: 'cancellation_requested',
    notes: `Customer requested order cancellation. Reason: ${reason.trim()}`,
    updatedBy: req.user.name || 'Customer'
  });
  await order.save();

  res.status(201).json(new ApiResponse(201, cancellationRequest, 'Cancellation request submitted successfully'));
});

// Admin: Get all cancellation requests with filter
export const getAllCancellationRequests = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  let query = {};
  if (status && status !== 'all') {
    query.status = status;
  }

  let requests = await CancellationRequest.find(query)
    .populate({
      path: 'order',
      populate: [
        { path: 'user', select: 'name email phone' },
        { path: 'items', populate: { path: 'product', select: 'name title images image' } }
      ]
    })
    .populate('user', 'name email phone')
    .populate('refund')
    .sort({ createdAt: -1 });

  // Handle in-memory search filtering if search term present
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    requests = requests.filter(r => {
      const orderNum = r.order?.orderNumber?.toLowerCase() || '';
      const orderId = r.order?._id?.toString().toLowerCase() || '';
      const userName = r.user?.name?.toLowerCase() || r.order?.user?.name?.toLowerCase() || '';
      const userEmail = r.user?.email?.toLowerCase() || r.order?.user?.email?.toLowerCase() || '';
      const reasonText = r.reason?.toLowerCase() || '';
      return orderNum.includes(s) || orderId.includes(s) || userName.includes(s) || userEmail.includes(s) || reasonText.includes(s);
    });
  }

  res.status(200).json(new ApiResponse(200, requests, 'Cancellation requests retrieved successfully'));
});

// Admin: Approve cancellation request
export const approveCancellation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const cancellationRequest = await CancellationRequest.findById(id).populate('order');
  if (!cancellationRequest) {
    throw new ApiError(404, 'Cancellation request not found');
  }

  if (cancellationRequest.status !== 'pending') {
    throw new ApiError(400, `Request has already been ${cancellationRequest.status}`);
  }

  const order = cancellationRequest.order;
  if (!order) {
    throw new ApiError(404, 'Associated order not found');
  }

  let refundRecord = null;
  let refundTriggered = false;

  // Check if order was paid online or has a captured payment record
  const capturedPayment = await Payment.findOne({ order: order._id, status: 'captured' });
  const isPaidOnline = order.paymentStatus === 'paid' || order.paymentMethod === 'Online' || !!capturedPayment;

  if (isPaidOnline && capturedPayment) {
    try {
      logger.info(`Triggering Razorpay refund for Order ${order._id}, amount: ${order.totalAmount}`);
      refundRecord = await paymentService.refundPayment(order._id, order.totalAmount);
      refundTriggered = true;
      cancellationRequest.refund = refundRecord._id;
    } catch (refundError) {
      logger.error(`Razorpay refund failed during cancellation approval for Order ${order._id}:`, refundError);
      throw new ApiError(500, `Cancellation approval failed: Could not process Razorpay refund. ${refundError.message}`);
    }
  } else {
    // For unpaid orders, directly update order status to cancelled
    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      notes: `Cancellation request approved by admin. ${adminNotes || ''}`.trim(),
      updatedBy: req.user.name || 'Admin'
    });
    await order.save();
  }

  cancellationRequest.status = 'approved';
  if (adminNotes) {
    cancellationRequest.adminNotes = adminNotes.trim();
  }
  await cancellationRequest.save();

  res.status(200).json(new ApiResponse(200, {
    cancellationRequest,
    refundTriggered,
    refund: refundRecord
  }, refundTriggered ? 'Cancellation request approved and Razorpay refund initiated successfully' : 'Cancellation request approved successfully'));
});

// Admin: Reject cancellation request
export const rejectCancellation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const cancellationRequest = await CancellationRequest.findById(id).populate('order');
  if (!cancellationRequest) {
    throw new ApiError(404, 'Cancellation request not found');
  }

  if (cancellationRequest.status !== 'pending') {
    throw new ApiError(400, `Request has already been ${cancellationRequest.status}`);
  }

  const order = cancellationRequest.order;
  if (!order) {
    throw new ApiError(404, 'Associated order not found');
  }

  // Revert order status to previous status or 'confirmed'
  const restoredStatus = cancellationRequest.previousOrderStatus || 'confirmed';
  order.orderStatus = restoredStatus;
  order.statusHistory.push({
    status: restoredStatus,
    notes: `Cancellation request rejected by admin. Reason: ${adminNotes || 'None provided'}`.trim(),
    updatedBy: req.user.name || 'Admin'
  });
  await order.save();

  cancellationRequest.status = 'rejected';
  if (adminNotes) {
    cancellationRequest.adminNotes = adminNotes.trim();
  }
  await cancellationRequest.save();

  res.status(200).json(new ApiResponse(200, cancellationRequest, 'Cancellation request rejected'));
});

// Customer: Get current user's cancellation requests
export const getUserCancellationRequests = asyncHandler(async (req, res) => {
  const requests = await CancellationRequest.find({ user: req.user._id })
    .populate('order', 'orderNumber totalAmount paymentMethod orderStatus paymentStatus createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, requests, 'User cancellation requests retrieved'));
});
