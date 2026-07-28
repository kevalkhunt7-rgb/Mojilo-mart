import ApiError from '../utils/ApiError.js';

/**
 * Authorize only specified roles
 * @param  {...String} roles 
 * @returns {Function}
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied: Role '${req.user.role}' is not authorized`));
    }
    
    next();
  };
};
