import express from 'express';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  bulkUploadSurveyResponses,
  generateSurveyWithAI,
} from '../controllers/surveys.js';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

const surveyRoutesFunction = (upload) => {
  // Public or general routes
  router.get('/', verifyToken, getSurveys);
  router.get('/:id', verifyToken, getSurveyById);

  // Routes for creating surveys, restricted to admin and agents
  router.post('/', verifyToken, authorizeRole(['admin', 'agent']), createSurvey);

  // Routes for updating surveys
  router.put('/:id', verifyToken, authorizeRole(['admin', 'agent']), updateSurvey);

  // Route for deleting surveys
  router.delete('/:id', verifyToken, authorizeRole(['admin', 'agent']), deleteSurvey);

  // Route for submitting a single survey response
  router.post('/:id/responses', verifyToken, submitSurveyResponse);

  // Route for bulk uploading survey responses, using the upload middleware
  router.post('/:surveyId/responses/bulk-upload', verifyToken, authorizeRole(['admin', 'agent']), upload.single('file'), bulkUploadSurveyResponses);

  // Route for generating a survey with AI
  router.post('/generate-with-ai', verifyToken, authorizeRole(['admin', 'agent']), generateSurveyWithAI);

  return router;
};

export default surveyRoutesFunction;
