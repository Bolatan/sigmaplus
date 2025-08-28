import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator.js';
import {
  createProject,
  getProjects,
  getProjectById,
  uploadFile,
  deleteProject,
  updateProject,
} from '../controllers/projects.js';
import multer from 'multer';

const router = express.Router();

// Create Project
router.post('/', [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').optional().trim(),
  validateRequest
], createProject);

// Get All Projects
router.get('/', getProjects);

// Get Project By ID
router.get('/:id', getProjectById);

// Delete Project
router.delete('/:id', [
], deleteProject);

// Update Project
router.put('/:id', [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').optional().trim(),
  validateRequest
], updateProject);

export default function(upload) {
  router.post('/upload', [
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