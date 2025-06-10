import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};