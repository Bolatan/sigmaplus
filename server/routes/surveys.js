import express from 'express';
import { body } from 'express-validator';
// import { authorize } from '../middleware/auth.js'; // Old auth
import { verifyToken, authorizeRole } from '../middleware/auth.js'; // New auth
import { validateRequest } from '../middleware/validator.js';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  bulkUploadSurveyResponses, // Import the new controller
} from '../controllers/surveys.js';
import { uploadFile } from '../controllers/projects.js';
import multer from 'multer'; // Import multer to check for MulterError instance
import upload from '../middleware/multer-config.js';

// We'll need multer's upload instance here.
// For now, let's assume it's passed when mounting, or we import a configured instance.

const router = express.Router();

// Create Survey
router.post('/', [
  verifyToken,
  authorizeRole(['admin', 'agent']),
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').optional().trim(),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('agentId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid Agent ID format'),
  body('companyIds').optional().isArray().withMessage('companyIds must be an array'),
  validateRequest
], createSurvey);

// Get All Surveys (filtered by role in controller)
router.get('/', verifyToken, getSurveys); // verifyToken to ensure user is logged in, controller handles role-based filtering

// Get Survey By ID (access controlled in controller)
router.get('/:id', verifyToken, getSurveyById); // verifyToken, controller handles role-based access

// Update Survey
router.put('/:id', [
  verifyToken,
  authorizeRole(['admin', 'agent']), // Controller further checks agent ownership
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'active', 'completed']),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('companyId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid Company ID format'),
  body('companyIds').optional().isArray().withMessage('companyIds must be an array'),
  body('agentId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid Agent ID format'),
  validateRequest
], updateSurvey);

// Delete Survey
router.delete('/:id', [
  verifyToken,
  authorizeRole(['admin', 'agent']), // Controller further checks agent ownership. If only admin, then ['admin']
], deleteSurvey);

// Submit Survey Response (any authenticated user can submit for now)
router.post('/:id/responses', [
  verifyToken,
  body('data').notEmpty().withMessage('Response data is required'), // Basic validation
  // Potentially more validation for response structure here
  validateRequest
], submitSurveyResponse);


// @route   POST /api/surveys/:surveyId/responses/bulk-upload
// @desc    Bulk upload survey responses from a CSV file
// @access  Admin, Agent
router.post(
  '/:surveyId/responses/bulk-upload',
  [
    verifyToken,
    authorizeRole(['admin', 'agent']),
    // Multer middleware for single file upload, expecting field name 'responsesCsv'
    // The 'upload' instance is configured in server/index.js and passed here.
    (req, res, next) => { // Wrapper to handle potential multer errors specifically
      const multerUpload = upload.single('responsesCsv');
      multerUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          return res.status(400).json({ errors: [{ msg: `File upload error: ${err.message}` }] });
        } else if (err) {
          // An unknown error occurred when uploading (e.g., file type filter).
          return res.status(400).json({ errors: [{ msg: err.message || 'File upload failed.' }] });
        }
        // Everything went fine with multer, proceed.
        next();
      });
    }
    // No express-validator here for the file itself, multer handles file presence/type.
    // Controller will handle CSV content validation.
  ],
  bulkUploadSurveyResponses
);
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

export default router;