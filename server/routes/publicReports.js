import express from 'express';
import { downloadReport } from '../controllers/reports.js';

const router = express.Router();

router.get('/:id/download', downloadReport);

export default router;
