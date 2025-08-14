import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getAdvancedAnalyticsData } from '../controllers/advanced-analytics.js';

const router = express.Router();

router.get('/', verifyToken, getAdvancedAnalyticsData);

export default router;
