import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js'; // Assuming you want to keep this
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/users.js';

const router = express.Router();

// GET all users (Admin only)
router.get(
    '/',
    verifyToken,
    authorizeRole(['admin']),
    getUsers
);

// GET user by ID (Admin only - or potentially user themselves, but admin focus for now)
router.get(
    '/:id',
    verifyToken,
    authorizeRole(['admin']),
    param('id').isMongoId().withMessage('Invalid user ID format.'),
    (req, res, next) => { // Handle validation result before controller
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    getUserById
);

// PUT update user by ID (Admin only)
router.put(
  '/:userId', // Changed param name to userId to match controller
  [
    verifyToken,
    authorizeRole(['admin']),
    param('userId').isMongoId().withMessage('Invalid user ID format.'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty.').trim().escape(),
    body('role').optional().isIn(['admin', 'agent', 'client']).withMessage('Invalid role specified.'),
    body('companyId').optional({ checkFalsy: true })
      .if(body('companyId').notEmpty())
      .isMongoId().withMessage('Invalid Company ID format.'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status. Must be active or inactive.'),
    // Email and password are NOT updatable via this route.
    validateRequest // Apply your existing general validator
  ],
  updateUser
);

// DELETE user by ID (Admin only) - Placeholder controller
router.delete(
    '/:id',
    verifyToken,
    authorizeRole(['admin']),
    param('id').isMongoId().withMessage('Invalid user ID format.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    deleteUser
);

export default router;