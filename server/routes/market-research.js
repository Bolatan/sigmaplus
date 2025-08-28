import express from 'express';
import { getMarketResearchData } from '../controllers/market-research.js';

const router = express.Router();

router.get('/', getMarketResearchData);

export default router;
