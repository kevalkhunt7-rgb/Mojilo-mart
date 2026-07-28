import settingRepository from '../repositories/settingRepository.js';
import pricingService from '../services/pricingService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingRepository.getSettings();
  res.status(200).json(new ApiResponse(200, settings, 'Global settings retrieved'));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingRepository.getSettings();
  const updatedSettings = await settingRepository.updateById(settings._id, req.body);
  res.status(200).json(new ApiResponse(200, updatedSettings, 'Global settings updated successfully'));
});

export const getPrintPriceCalculation = asyncHandler(async (req, res) => {
  const { width, height } = req.query;
  if (!width || !height) {
    return res.status(400).json(new ApiResponse(400, null, 'Both width and height query parameters are required'));
  }
  const breakdown = await pricingService.calculatePrintPrice({ width, height });
  res.status(200).json(new ApiResponse(200, breakdown, 'Print price calculated successfully'));
});
