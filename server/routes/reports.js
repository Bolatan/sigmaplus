import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
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

router.get('/', verifyToken, getReports);
router.get('/:id', verifyToken, getReportById);
router.get('/:id/download', verifyToken, downloadReport);

router.post('/', [
  verifyToken,
  authorizeRole(['admin', 'agent']),
  body('surveyId').notEmpty().isMongoId(),
  body('title').notEmpty().trim(),
  body('clientId').optional().isMongoId(),
  validateRequest
], generateReport);

router.put('/:id', [
  verifyToken,
  authorizeRole(['admin', 'agent']),
  body('title').optional().notEmpty().trim(),
  validateRequest
], updateReport);

router.delete('/:id', verifyToken, authorizeRole(['admin']), deleteReport);

export default router;
