import express from 'express';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  bulkUploadSurveyResponses,
} from '../controllers/surveys.js';

const router = express.Router();

const surveyRoutesFunction = (upload) => {
  // Public or general routes
  router.get('/', getSurveys);
  router.get('/:id', getSurveyById);

  // Routes for creating surveys, restricted to admin and agents
  router.post('/', createSurvey);

  // Routes for updating surveys
  router.put('/:id', updateSurvey);

  // Route for deleting surveys
  router.delete('/:id', deleteSurvey);

  // Route for submitting a single survey response
  router.post('/:id/responses', submitSurveyResponse);

  // Route for bulk uploading survey responses, using the upload middleware
  router.post('/:surveyId/responses/bulk-upload', upload.single('file'), bulkUploadSurveyResponses);

  return router;
};

export default surveyRoutesFunction;
