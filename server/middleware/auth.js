import jwt from 'jsonwebtoken';

// JWT Secret must be in environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if the header starts with 'Bearer '
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Token is not valid (must be Bearer token)' });
  }

  const token = tokenParts[1];

  if (!token) { // Should be caught by !authHeader, but as a safeguard
    return res.status(401).json({ msg: 'No token found after Bearer, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user; // Add user from payload (e.g., { id: '...', role: '...' })
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(500).json({ msg: 'Server error during token verification' });
  }
};

// Middleware to authorize based on user role
// rolesArray: an array of roles that are allowed to access the route
const authorizeRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      // This should ideally not happen if verifyToken runs first and is successful
      return res.status(403).json({ msg: 'User role not found, authorization denied' });
    }

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Access denied. User role '${req.user.role}' is not authorized for this resource.`
      });
    }
    next(); // Role is authorized
  };
};

export { verifyToken, authorizeRole };
