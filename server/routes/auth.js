import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// JWT Secret must be in environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('role', 'Role is required and must be one of: admin, agent, client').isIn(['admin', 'agent', 'client']),
    body('companyId')
      .if(body('role').equals('client')) // Apply this validation only if role is client
      .notEmpty().withMessage('Company ID is required for client roles.')
      .isMongoId().withMessage('Invalid Company ID format for client roles.')
      .else(body('companyId').optional().isMongoId().withMessage('Invalid Company ID format.')), // For admin/agent, it's optional but must be valid if provided
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, companyId } = req.body;

    try {
      const db = getDb();
      let user = await db.collection('users').findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUserDocument = {
        name,
        email,
        password: hashedPassword,
        role,
        status: 'active', // Default status for new users
        createdAt: new Date(),
        updatedAt: new Date(), // Add updatedAt
      };

      if (companyId) {
        newUserDocument.companyId = new ObjectId(companyId);
      }

      const result = await db.collection('users').insertOne(newUserDocument);

      // Fetch the full user document to ensure all fields are present in the response
      const createdUser = await db.collection('users').findOne({ _id: result.insertedId });

      // Remove password before sending back
      if (createdUser) {
        delete createdUser.password;
      }

      const payload = { user: { id: createdUser._id, email: createdUser.email, role: createdUser.role } };
      jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
        if (err) {
            console.error('JWT sign error during registration: ', err);
            // Don't throw here, as user is already created. Log and potentially send user without token, or specific error.
            // For now, we'll send user if token fails, but ideally this should be robust.
            return res.status(201).json({ user: createdUser, token: null, error: "Token signing failed" });
        }
        res.status(201).json({ token, user: createdUser });
      });

    } catch (err) {
      console.error('Error in /api/auth/register:', err);
      res.status(500).json({ errors: [{ msg: 'Server error during registration' }]});
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const db = getDb();
      const user = await db.collection('users').findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const payload = {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          // Return user info along with token for convenience on frontend
          res.json({
            token,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              companyId: user.companyId // include companyId if it exists
            }
          });
        }
      );
    } catch (err) {
      console.error('Error in /api/auth/login:', err);
      res.status(500).json({ errors: [{ msg: 'Server error during login' }]});
    }
  }
);

export default router;
