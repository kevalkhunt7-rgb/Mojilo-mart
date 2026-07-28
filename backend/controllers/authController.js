import authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Registration successful. OTP sent.'));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  
  // Set refresh token cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  res.status(200).json(new ApiResponse(200, {
    user: result.user,
    accessToken: result.accessToken
  }, 'Login successful'));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const result = await authService.refreshUserSession(token);

  // Set new refresh token cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(200).json(new ApiResponse(200, {
    accessToken: result.accessToken
  }, 'Token refreshed successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logoutUser(token);

  res.clearCookie('refreshToken');
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body);
  res.status(200).json(new ApiResponse(200, result, 'Email verified successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.sendForgotPasswordOTP(req.body.email);
  res.status(200).json(new ApiResponse(200, result, 'Password reset OTP sent'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.status(200).json(new ApiResponse(200, result, 'Password updated successfully'));
});
