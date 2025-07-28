import express from 'express';
import { body, validationResult } from 'express-validator';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// JWT Secret must be in environment variable
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
  process.exit(1);
}

// Validation middleware
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .escape(),
    
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('role')
    .isIn(['admin', 'agent', 'client'])
    .withMessage('Role must be one of: admin, agent, client'),
    
  // Custom validation for companyId based on role
  // body('companyId').custom((value, { req }) => {
  //   const { role } = req.body;
    
  //   if (role === 'client') {
  //     if (!value) {
  //       throw new Error('Company ID is required for client roles');
  //     }
  //     if (!ObjectId.isValid(value)) {
  //       throw new Error('Invalid Company ID format for client roles');
  //     }
  //   } else if ((role === 'admin' || role === 'agent') && value) {
  //     if (!ObjectId.isValid(value)) {
  //       throw new Error('Invalid Company ID format');
  //     }
  //   }
    
  //   return true;
  // })
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to generate JWT token
const generateToken = (user) => {
  return new Promise((resolve, reject) => {
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        ...(user.companyId && { companyId: user.companyId })
      }
    };
    
    jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

// Helper function to sanitize user data for response
const sanitizeUser = (user) => {
  const sanitized = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  
  if (user.companyId) {
    sanitized.companyId = user.companyId;
  }
  
  return sanitized;
};

// Helper function to check if company exists (optional enhancement)
const validateCompanyExists = async (companyId) => {
  const db = getDb();
  const company = await db.collection('companies').findOne({ _id: new ObjectId(companyId) });
  return !!company;
};

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    const { name, email, password, role, companyId } = req.body;
    const db = getDb();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        errors: [{ msg: 'User already exists' }],
        message: 'Registration failed'
      });
    }

    // Optional: Validate company exists if companyId is provided
    if (companyId) {
      const companyExists = await validateCompanyExists(companyId);
      if (!companyExists) {
        return res.status(400).json({
          success: false,
          errors: [{ msg: 'Company not found' }],
          message: 'Invalid company ID'
        });
      }
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Create user document
    const newUserDocument = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add companyId if provided
    if (companyId) {
      newUserDocument.companyId = new ObjectId(companyId);
    }

    // Insert user
    const result = await db.collection('users').insertOne(newUserDocument);

    // Fetch the created user
    const createdUser = await db.collection('users').findOne({ _id: result.insertedId });
    
    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const token = await generateToken(createdUser);

    // Return response with sanitized user data
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: sanitizeUser(createdUser)
    });

  } catch (err) {
    console.error('Error in /api/auth/register:', err);
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: 'User already exists' }],
        message: 'Registration failed'
      });
    }
    
    res.status(500).json({
      success: false,
      errors: [{ msg: 'Server error during registration' }],
      message: 'Internal server error'
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    const { email, password } = req.body;
    const db = getDb();

    // Find user by email
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        errors: [{ msg: 'User not found' }],
        message: 'Login failed'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(400).json({
        success: false,
        errors: [{ msg: 'Account is not active' }],
        message: 'Login failed'
      });
    }

    // Verify password
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        errors: [{ msg: 'Invalid credentials' }],
        message: 'Login failed'
      });
    }

    // Update last login timestamp
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Generate JWT token
    const token = await generateToken(user);

    // Return response with sanitized user data
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    });

  } catch (err) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({
      success: false,
      errors: [{ msg: 'Server error during login' }],
      message: 'Internal server error'
    });
  }
});

// @route   POST api/auth/refresh
// @desc    Refresh JWT token
// @access  Private (requires valid token)
router.post('/refresh', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify current token
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    
    // Get fresh user data
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.user.id) });
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or inactive user'
      });
    }

    // Generate new token
    const newToken = await generateToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: sanitizeUser(user)
    });

  } catch (err) {
    console.error('Error in /api/auth/refresh:', err);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;
