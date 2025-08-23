import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getQuestionBank } from '../controllers/question-bank.js';

const router = express.Router();

router.get('/', verifyToken, getQuestionBank);

export default router;
