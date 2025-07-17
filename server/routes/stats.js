import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getSurveyStatuses, getResponsesBySurvey } from '../controllers/stats.js';

const router = express.Router();

router.get('/survey-statuses', verifyToken, getSurveyStatuses);
router.get('/responses-by-survey', verifyToken, getResponsesBySurvey);

export default router;
