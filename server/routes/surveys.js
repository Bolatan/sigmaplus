import express from 'express';
import { body } from 'express-validator';
// import { authorize } from '../middleware/auth.js'; // Old auth
import { verifyToken, authorizeRole } from '../middleware/auth.js'; // New auth
import { validateRequest } from '../middleware/validator.js';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse
} from '../controllers/surveys.js';

const router = express.Router();

// Create Survey
router.post('/', [
  verifyToken,
  authorizeRole(['admin', 'agent']),
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').optional().trim(),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  // status and companyId are handled in controller or can be added here if strict validation from client is needed
  validateRequest
], createSurvey);

// Get All Surveys (filtered by role in controller)
router.get('/', verifyToken, getSurveys); // verifyToken to ensure user is logged in, controller handles role-based filtering

// Get Survey By ID (access controlled in controller)
router.get('/:id', verifyToken, getSurveyById); // verifyToken, controller handles role-based access

// Update Survey
router.put('/:id', [
  verifyToken,
  authorizeRole(['admin', 'agent']), // Controller further checks agent ownership
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'active', 'completed']),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('companyId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid Company ID format'),
  validateRequest
], updateSurvey);

// Delete Survey
router.delete('/:id', [
  verifyToken,
  authorizeRole(['admin', 'agent']), // Controller further checks agent ownership. If only admin, then ['admin']
], deleteSurvey);

// Submit Survey Response (any authenticated user can submit for now)
router.post('/:id/responses', [
  verifyToken,
  body('data').notEmpty().withMessage('Response data is required'), // Basic validation
  // Potentially more validation for response structure here
  validateRequest
], submitSurveyResponse);

export default router;