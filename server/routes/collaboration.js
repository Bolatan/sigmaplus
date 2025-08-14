import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getCollaborationData } from '../controllers/collaboration.js';

const router = express.Router();

router.get('/', verifyToken, getCollaborationData);

export default router;
