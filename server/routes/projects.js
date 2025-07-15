import express from 'express';
import { body } from 'express-validator';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validator.js';
import {
  createProject,
  getProjects,
  getProjectById,
  uploadFile,
  deleteProject,
} from '../controllers/projects.js';
import multer from 'multer';

const router = express.Router();

// Create Project
router.post('/', [
  verifyToken,
  authorizeRole(['admin', 'agent']),
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').optional().trim(),
  validateRequest
], createProject);

// Get All Projects
router.get('/', verifyToken, getProjects);

// Get Project By ID
router.get('/:id', verifyToken, getProjectById);

// Delete Project
router.delete('/:id', [
  verifyToken,
  authorizeRole(['admin', 'agent']),
], deleteProject);

export default function(upload) {
  router.post('/upload', [
    verifyToken,
    (req, res, next) => {
      const multerUpload = upload.single('file');
      multerUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ errors: [{ msg: `File upload error: ${err.message}` }] });
        } else if (err) {
          return res.status(400).json({ errors: [{ msg: err.message || 'File upload failed.' }] });
        }
        next();
      });
    }
  ], uploadFile);

  return router;
}