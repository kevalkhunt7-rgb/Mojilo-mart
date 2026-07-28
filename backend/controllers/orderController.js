import orderService from '../services/orderService.js';
import orderRepository from '../repositories/orderRepository.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js'; // Imported to execute safe manual lookups
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

export const placeOrder = asyncHandler(async (req, res) => {
  const result = await orderService.placeOrder(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Order placed successfully'));
});

export const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await orderRepository.findWithDetails(req.params.id);
  res.status(200).json(new ApiResponse(200, order, 'Order details retrieved'));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const updatedOrder = await orderService.updateOrderStatus(req.params.id, {
    status: req.body.status,
    notes: req.body.notes,
    userId: req.user._id
  });
  res.status(200).json(new ApiResponse(200, updatedOrder, `Order status updated to ${req.body.status}`));
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();

  const populatedOrders = await orderRepository.populateOrdersHelper(orders);
  res.status(200).json(new ApiResponse(200, populatedOrders, 'Orders retrieved successfully'));
});