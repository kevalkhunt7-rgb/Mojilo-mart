import shippingService from '../services/shippingService.js';
import ShippingMethod from '../models/ShippingMethod.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getShippingMethods = asyncHandler(async (req, res) => {
  let methods;
  if (req.user && req.user.role === 'admin') {
    methods = await ShippingMethod.find({}).sort({ createdAt: -1 });
  } else {
    const amount = Number(req.query.amount) || 0;
    methods = await shippingService.getActiveMethods(amount);
  }
  res.status(200).json(new ApiResponse(200, methods, 'Shipping methods retrieved'));
});

export const createShipment = asyncHandler(async (req, res) => {
  const { orderId, carrier, trackingNumber } = req.body;
  const shipment = await shippingService.createShipment(orderId, { carrier, trackingNumber });
  res.status(201).json(new ApiResponse(201, shipment, 'Shipment registered and carrier notified'));
});

export const addCheckpoint = asyncHandler(async (req, res) => {
  const checkpoint = await shippingService.addTrackingCheckpoint(req.params.shipmentId, req.body);
  res.status(201).json(new ApiResponse(201, checkpoint, 'Tracking checkpoint added successfully'));
});

export const createShippingMethod = asyncHandler(async (req, res) => {
  const method = await ShippingMethod.create(req.body);
  res.status(201).json(new ApiResponse(201, method, 'Shipping method created successfully'));
});

export const updateShippingMethod = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const method = await ShippingMethod.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!method) {
    throw new ApiError(404, 'Shipping method not found');
  }
  res.status(200).json(new ApiResponse(200, method, 'Shipping method updated successfully'));
});

export const deleteShippingMethod = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const method = await ShippingMethod.findByIdAndDelete(id);
  if (!method) {
    throw new ApiError(404, 'Shipping method not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Shipping method deleted successfully'));
});

