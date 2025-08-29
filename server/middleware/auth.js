import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expects "Bearer TOKEN"

  if (!token) {
    return next(new ApiError(401, 'No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(403, 'Invalid token.'));
  }
};

export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(403, 'Authentication error: User role not found.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied. User with role '${req.user.role}' is not authorized.`));
    }

    next();
  };
};
