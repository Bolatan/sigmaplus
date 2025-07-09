import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js'; // Assuming you have this
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} from '../controllers/companies.js';

const router = express.Router();

// @route   POST api/companies
// @desc    Create a new company
// @access  Admin
router.post(
  '/',
  [
    verifyToken,
    authorizeRole(['admin']), // Only admins can create companies
    body('name').notEmpty().withMessage('Company name is required.').trim().escape(),
    body('email').isEmail().withMessage('Valid company email is required.').normalizeEmail(),
    body('phone').notEmpty().withMessage('Company phone is required.').trim(),
    body('address').notEmpty().withMessage('Company address is required.').trim(),
    body('employeeCount').optional().isInt({ min: 0 }).withMessage('Employee count must be a non-negative integer.'),
    body('website').optional().isURL().withMessage('Valid website URL required.'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive.'),
    validateRequest // Your custom middleware to handle validation results
  ],
  createCompany
);

// @route   GET api/companies
// @desc    Get all companies
// @access  Authenticated (any role for now, controller can refine if needed)
router.get(
  '/',
  verifyToken,
  getCompanies
);

// @route   GET api/companies/:id
// @desc    Get company by ID
// @access  Authenticated
router.get(
  '/:id',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid Company ID format.'),
  (req, res, next) => { // Inline validation error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  getCompanyById
);

// @route   PUT api/companies/:id
// @desc    Update a company
// @access  Admin
router.put(
  '/:id',
  [
    verifyToken,
    authorizeRole(['admin']),
    param('id').isMongoId().withMessage('Invalid Company ID format.'),
    body('name').optional().notEmpty().withMessage('Company name cannot be empty.').trim().escape(),
    body('email').optional().isEmail().withMessage('Valid company email required.').normalizeEmail(),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('employeeCount').optional().isInt({ min: 0 }).withMessage('Employee count must be a non-negative integer.'),
    body('website').optional({ checkFalsy: true }).isURL().withMessage('Valid website URL required.'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive.'),
    validateRequest
  ],
  updateCompany
);

// @route   DELETE api/companies/:id
// @desc    Delete a company
// @access  Admin
router.delete(
  '/:id',
  verifyToken,
  authorizeRole(['admin']),
  param('id').isMongoId().withMessage('Invalid Company ID format.'),
  (req, res, next) => { // Inline validation error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  deleteCompany
);

export default router;
