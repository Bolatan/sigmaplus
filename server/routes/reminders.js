import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { createReminder, getRemindersForSurvey } from '../controllers/reminders.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole(['admin', 'agent']), createReminder);
router.get('/:surveyId', verifyToken, authorizeRole(['admin', 'agent']), getRemindersForSurvey);

export default router;
