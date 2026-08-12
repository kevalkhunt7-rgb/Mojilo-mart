import couponService from '../services/couponService.js';
import Coupon from '../models/Coupon.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const code = (req.body.code || '').trim().toUpperCase();
  const amount = Number(req.body.amount ?? req.body.orderSubtotal ?? req.body.subTotal ?? req.body.subtotal ?? 0);
  const result = await couponService.validateCoupon(code, amount);
  res.status(200).json(new ApiResponse(200, result, 'Coupon code validated successfully'));
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
  }).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, coupons, 'Available coupons retrieved successfully'));
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, coupons, 'Coupons retrieved successfully'));
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }
  res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated successfully'));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});

