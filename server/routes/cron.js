import express from 'express';
import { generateAllReports } from '../controllers/reports.js';

const router = express.Router();

router.post('/generate-reports', generateAllReports);

export default router;
