import dashboardService from '../services/dashboardService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  res.status(200).json(new ApiResponse(200, stats, 'Dashboard analytics retrieved'));
});
