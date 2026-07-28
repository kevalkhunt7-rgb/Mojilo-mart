import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not an instance of ApiError, transform it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Log error
  logger.error(`${req.method} ${req.url} - Error: ${error.message}`, {
    stack: error.stack,
    errors: error.errors
  });

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  };

  res.status(error.statusCode).json(response);
};
