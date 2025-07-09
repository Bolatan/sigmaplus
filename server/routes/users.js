import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js'; // Assuming you want to keep this
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  setUserPasswordByAdmin
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
    body('companyId')
      .optional({ checkFalsy: true }) // Allows null or empty string to be passed for unsetting
      .custom(async (value, { req }) => {
        const newRole = req.body.role;
        const isCompanyIdProvided = value !== null && value !== undefined && value !== ''; // True if companyId is being set or changed
        const effectiveRole = newRole || req.currentUserRole; // Use new role if provided, else existing (from pre-controller middleware)

        // If effective role is 'client', companyId must be a valid MongoID string
        if (effectiveRole === 'client') {
          if (!value || !ObjectId.isValid(value)) { // value here is newCompanyId
            throw new Error('Company ID is required and must be a valid ID for client roles.');
          }
        }

        // If companyId is provided (not null/empty), it must be a valid MongoID (for any role it's being applied to)
        if (isCompanyIdProvided && !ObjectId.isValid(value)) {
            throw new Error('Invalid Company ID format.');
        }
        return true;
      }),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status. Must be active or inactive.'),
    validateRequest
  ],
  async (req, res, next) => { // Pre-controller middleware to load current user's role for validation context
    // This middleware ensures req.currentUserRole is set if role is not in req.body
    // This helps the custom validator for companyId make decisions based on the user's role context.
    if (req.body.role === undefined && !req.currentUserRole) { // Only fetch if role isn't being changed AND not already fetched
      try {
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.userId) }, { projection: { role: 1 } });
        if (user) {
          req.currentUserRole = user.role; // Make current role available to subsequent validators/controller
        } else {
          // If user not found here, controller will handle it with 404, but validator might run first.
          // It's okay if currentUserRole is not set, validator will use req.body.role if present.
        }
      } catch (e) {
        console.error("Could not fetch current user role for companyId validation:", e);
        // Proceed, but companyId validation might be incomplete if role isn't in body
      }
    }
    next();
  },
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

// @route   PUT api/users/:userId/set-password
// @desc    Set/Change a user's password by Admin
// @access  Admin
router.put(
    '/:userId/set-password',
    [
        verifyToken,
        authorizeRole(['admin']),
        param('userId').isMongoId().withMessage('Invalid user ID format.'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long.'),
        validateRequest // Apply your existing general validator
    ],
    setUserPasswordByAdmin
);

export default router;