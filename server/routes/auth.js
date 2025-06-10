import express from 'express';
import { body } from 'express-validator';
import { login, register, refreshToken } from '../controllers/auth.js';
import { validateRequest } from '../middleware/validator.js';

const router = express.Router();

router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
], login);

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['admin', 'agent', 'client']).withMessage('Invalid role'),
  validateRequest
], register);

router.post('/refresh-token', refreshToken);

export default router;