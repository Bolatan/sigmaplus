import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getMarketResearchData } from '../controllers/market-research.js';

const router = express.Router();

router.get('/', verifyToken, getMarketResearchData);

export default router;
