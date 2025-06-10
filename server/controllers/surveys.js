import { ApiError } from '../utils/ApiError.js';

// Mock database - replace with actual database in production
let surveys = [];
let responses = [];

export const createSurvey = async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;
    const survey = {
      id: Date.now().toString(),
      title,
      description,
      questions,
      createdBy: req.user.id,
      companyId: req.user.companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    surveys.push(survey);
    res.status(201).json({ status: 'success', data: survey });
  } catch (error) {
    next(error);
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    let filteredSurveys = [...surveys];

    // Filter surveys based on user role and company
    if (req.user.role === 'client') {
      filteredSurveys = filteredSurveys.filter(
        survey => survey.companyId === req.user.companyId
      );
    } else if (req.user.role === 'agent') {
      filteredSurveys = filteredSurveys.filter(
        survey => survey.createdBy === req.user.id
      );
    }

    res.json({ status: 'success', data: filteredSurveys });
  } catch (error) {
    next(error);
  }
};

export const getSurveyById = async (req, res, next) => {
  try {
    const survey = surveys.find(s => s.id === req.params.id);
    
    if (!survey) {
      throw new ApiError(404, 'Survey not found');
    }

    // Check if user has access to this survey
    if (req.user.role === 'client' && survey.companyId !== req.user.companyId) {
      throw new ApiError(403, 'Not authorized to access this survey');
    }

    res.json({ status: 'success', data: survey });
  } catch (error) {
    next(error);
  }
};

export const updateSurvey = async (req, res, next) => {
  try {
    const surveyIndex = surveys.findIndex(s => s.id === req.params.id);
    
    if (surveyIndex === -1) {
      throw new ApiError(404, 'Survey not found');
    }

    const survey = surveys[surveyIndex];

    // Check if user has permission to update
    if (req.user.role === 'agent' && survey.createdBy !== req.user.id) {
      throw new ApiError(403, 'Not authorized to update this survey');
    }

    const updatedSurvey = {
      ...survey,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    surveys[surveyIndex] = updatedSurvey;
    res.json({ status: 'success', data: updatedSurvey });
  } catch (error) {
    next(error);
  }
};

export const deleteSurvey = async (req, res, next) => {
  try {
    const surveyIndex = surveys.findIndex(s => s.id === req.params.id);
    
    if (surveyIndex === -1) {
      throw new ApiError(404, 'Survey not found');
    }

    surveys.splice(surveyIndex, 1);
    res.json({ status: 'success', message: 'Survey deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const submitSurveyResponse = async (req, res, next) => {
  try {
    const survey = surveys.find(s => s.id === req.params.id);
    
    if (!survey) {
      throw new ApiError(404, 'Survey not found');
    }

    const response = {
      id: Date.now().toString(),
      surveyId: req.params.id,
      data: req.body.data,
      respondentId: req.user.id,
      createdAt: new Date().toISOString(),
      location: req.body.location,
      demographics: req.body.demographics
    };

    responses.push(response);
    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    next(error);
  }
};