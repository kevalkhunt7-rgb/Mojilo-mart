import ApiError from '../utils/ApiError.js';

/**
 * Authorize only users possessing specific permission keys
 * @param {String} permission 
 * @returns {Function}
 */
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    // Admins bypass all granular permission checks
    if (req.user.role === 'admin') {
      return next();
    }

    const hasPermission = req.user.permissions && req.user.permissions.includes(permission);
    if (!hasPermission) {
      return next(new ApiError(403, `Access denied: Missing required permission: '${permission}'`));
    }

    next();
  };
};
