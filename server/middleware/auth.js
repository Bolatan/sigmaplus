import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Invalid token format');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Not authorized to access this resource');
    }
    next();
  };
};