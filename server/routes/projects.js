import express from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from '../controllers/projects.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/:id').get(protect, getProjectById).put(protect, updateProject).delete(protect, deleteProject);

export default router;
