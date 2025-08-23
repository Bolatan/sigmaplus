import { getDb } from '../utils/db.js';

const questionBank = [
  { id: 'qb1', text: 'What is your age?', type: 'single-choice', options: ['Under 18', '18-24', '25-34', '35-44', '45+'] },
  { id: 'qb2', text: 'What is your gender?', type: 'single-choice', options: ['Male', 'Female', 'Other'] },
  { id: 'qb3', text: 'What is your annual household income?', type: 'single-choice', options: ['Less than $25,000', '$25,000 to $49,999', '$50,000 to $99,999', '$100,000 to $149,999', '$150,000 or more'] },
  { id: 'qb4', text: 'What is your highest level of education?', type: 'single-choice', options: ['High school or less', 'Some college', 'Bachelor\'s degree', 'Master\'s degree', 'Doctoral degree'] },
];

export const getQuestionBank = async (req, res, next) => {
  try {
    // In the future, we can fetch this from a database collection
    res.json({ status: 'success', data: { questions: questionBank } });
  } catch (error) {
    next(error);
  }
};
