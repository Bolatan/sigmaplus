import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

export const getMultiSurveyAnalysisData = async (req, res, next) => {
  try {
    const db = getDb();
    const { survey_group_id } = req.query;

    if (!survey_group_id || !ObjectId.isValid(survey_group_id)) {
      return res.status(400).json({ message: 'A valid survey_group_id is required.' });
    }

    const surveyGroup = await db.collection('survey_groups').findOne({ _id: new ObjectId(survey_group_id) });

    if (!surveyGroup) {
      return res.status(404).json({ message: 'Survey group not found.' });
    }

    const surveyIds = surveyGroup.surveyIds.map(id => new ObjectId(id));

    // Fetch all surveys in the group to get their questions
    const surveys = await db.collection('surveys').find({ _id: { $in: surveyIds } }).toArray();

    // Fetch all responses for the surveys in the group
    const responses = await db.collection('responses').find({ surveyId: { $in: surveyIds } }).toArray();

    const aggregatedData = {};

    // Initialize aggregatedData with all questions from all surveys
    surveys.forEach(survey => {
      survey.questions.forEach(question => {
        if (!aggregatedData[question.id]) {
          aggregatedData[question.id] = {
            text: question.text,
            type: question.type,
            responses: {}
          };
        }
      });
    });

    // Aggregate responses
    responses.forEach(response => {
      for (const [questionId, answer] of Object.entries(response.responseData)) {
        if (aggregatedData[questionId]) {
          if (Array.isArray(answer)) { // For multiple-choice
            answer.forEach(option => {
              aggregatedData[questionId].responses[option] = (aggregatedData[questionId].responses[option] || 0) + 1;
            });
          } else { // For single-choice, rating, etc.
            aggregatedData[questionId].responses[answer] = (aggregatedData[questionId].responses[answer] || 0) + 1;
          }
        }
      }
    });

    res.json({ status: 'success', data: aggregatedData });
  } catch (error) {
    next(error);
  }
};
