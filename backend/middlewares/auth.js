import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  let token;

  // Check headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_access_secret_key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new ApiError(401, 'User account no longer exists'));
    }
    
    if (!user.isEmailVerified) {
      return next(new ApiError(403, 'Please verify your email address first'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token'));
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_access_secret_key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isEmailVerified) {
      req.user = user;
    }
  } catch (error) {
    // Ignore error in optional authentication
  }
  next();
};
