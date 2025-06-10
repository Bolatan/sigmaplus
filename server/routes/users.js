import express from 'express';
import { body } from 'express-validator';
import { authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/users.js';

const router = express.Router();

router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUserById);

router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  validateRequest
], updateUser);

router.delete('/:id', authorize('admin'), deleteUser);

export default router;