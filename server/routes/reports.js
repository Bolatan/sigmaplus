import express from 'express';
import { body } from 'express-validator';
import { authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';
import {
  generateReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
} from '../controllers/reports.js';

const router = express.Router();

router.post('/', [
  authorize('admin', 'agent'),
  body('surveyId').notEmpty().withMessage('Survey ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  validateRequest
], generateReport);

router.get('/', getReports);
router.get('/:id', getReportById);

router.put('/:id', [
  authorize('admin', 'agent'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  validateRequest
], updateReport);

router.delete('/:id', authorize('admin'), deleteReport);

export default router;