import express from 'express';
import {
  getReports,
  getReportById,
  generateReport,
  updateReport,
  deleteReport,
  downloadReport
} from '../controllers/reports.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';

const router = express.Router();

router.get('/', getReports);
router.get('/:id', getReportById);
router.get('/:id/download', downloadReport);

router.post('/', [
  body('surveyId').notEmpty().isMongoId(),
  body('title').notEmpty().trim(),
  body('clientId').optional().isMongoId(),
  validateRequest
], generateReport);

router.put('/:id', [
  body('title').optional().notEmpty().trim(),
  validateRequest
], updateReport);

router.delete('/:id', deleteReport);

export default router;
