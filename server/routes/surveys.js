import express from 'express';
import { body } from 'express-validator';
import { authorize } from '../middleware/auth.js';
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

router.post('/', [
  authorize('admin', 'agent'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  validateRequest
], createSurvey);

router.get('/', getSurveys);
router.get('/:id', getSurveyById);

router.put('/:id', [
  authorize('admin', 'agent'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  validateRequest
], updateSurvey);

router.delete('/:id', authorize('admin'), deleteSurvey);

router.post('/:id/responses', [
  body('data').notEmpty().withMessage('Response data is required'),
  validateRequest
], submitSurveyResponse);

export default router;