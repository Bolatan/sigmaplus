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
    body('companyId').optional({ checkFalsy: true }).custom(async (value, { req }) => {
      const newRole = req.body.role;
      const userId = req.params.userId;
      let effectiveRole = newRole;

      // If role is not being changed, we need to fetch the user's current role
      if (!newRole && userId) {
        try {
          const db = getDb();
          const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { role: 1 } });
          if (user) {
            effectiveRole = user.role;
          } else {
            // Let the controller handle the "user not found" error.
            // For validation, we proceed assuming it might be a new user or ID is wrong,
            // but we cannot determine role-based requirements.
            return true;
          }
        } catch (error) {
          // Log the error but don't block, as it might be a malformed ID
          // which will be caught by other validators.
          console.error("DB error during companyId validation:", error);
          throw new Error('Could not verify user role for company ID validation.');
        }
      }

      // Rule: If the effective role is 'client', a valid companyId is mandatory.
      if (effectiveRole === 'client') {
        if (!value || !ObjectId.isValid(value)) {
          throw new Error('Company ID is required and must be a valid ID for client roles.');
        }
      }

      // Rule: If a companyId is provided (for any role), it must be a valid MongoID format.
      if (value && !ObjectId.isValid(value)) {
        throw new Error('Invalid Company ID format.');
      }

      return true; // Passes validation
    }),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status. Must be active or inactive.'),
    validateRequest
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