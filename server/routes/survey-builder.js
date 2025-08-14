import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getSurveyBuilderData } from '../controllers/survey-builder.js';

const router = express.Router();

router.get('/', verifyToken, getSurveyBuilderData);

export default router;
