import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMultiSurveyAnalysisData } from '../controllers/multi-survey-analysis.js';

const router = express.Router();

router.get('/', verifyToken, getMultiSurveyAnalysisData);

export default router;
