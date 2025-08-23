import express from 'express';
import { getDashboardPreferences, updateDashboardPreferences } from '../controllers/dashboard.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes in this file are protected
router.use(verifyToken);

router.get('/preferences', getDashboardPreferences);
router.post('/preferences', updateDashboardPreferences);

export default router;
