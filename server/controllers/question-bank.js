import { getDb } from '../utils/db.js';

const questionBank = [
    { id: 'qb1', text: 'What is your age?', type: 'single-choice', options: ['Under 18', '18-24', '25-34', '35-44', '45+'] },
    { id: 'qb2', text: 'What is your gender?', type: 'single-choice', options: ['Male', 'Female', 'Other'] },
    { id: 'qb3', text: 'What is your annual household income?', type: 'single-choice', options: ['Less than $25,000', '$25,000 to $49,999', '$50,000 to $99,999', '$100,000 to $149,999', '$150,000 or more'] },
    { id: 'qb4', text: 'What is your highest level of education?', type: 'single-choice', options: ['High school or less', 'Some college', 'Bachelor\'s degree', 'Master\'s degree', 'Doctoral degree'] },
    { id: 'qb5', text: 'Which of the following social media platforms do you use?', type: 'multiple-choice', options: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok', 'Other'] },
    { id: 'qb6', text: 'How satisfied are you with our product?', type: 'matrix', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'] },
    { id: 'qb7', text: 'How likely are you to recommend our company to a friend or colleague?', type: 'nps', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
    { id: 'qb8', text: 'Please rank the following features in order of importance.', type: 'ranking', options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'] },
    { id: 'qb9', text: 'What is your employment status?', type: 'single-choice', options: ['Employed full-time', 'Employed part-time', 'Self-employed', 'Unemployed', 'Student', 'Retired'] },
    { id: 'qb10', text: 'How often do you purchase our products?', type: 'single-choice', options: ['Daily', 'Weekly', 'Monthly', 'A few times a year', 'Rarely'] },
    { id: 'qb11', text: 'What factors influence your purchasing decisions?', type: 'multiple-choice', options: ['Price', 'Quality', 'Brand reputation', 'Customer service', 'Recommendations'] },
    { id: 'qb12', text: 'Please provide any additional feedback.', type: 'open-ended' },
    { id: 'qb13', text: 'What is your marital status?', type: 'single-choice', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
    { id: 'qb14', text: 'How did you hear about us?', type: 'multiple-choice', options: ['Social media', 'Search engine', 'Friend or colleague', 'Advertisement', 'Other'] },
    { id: 'qb15', text: 'On a scale of 1 to 5, how easy was it to use our website?', type: 'matrix', options: ['1 (Very Difficult)', '2', '3', '4', '5 (Very Easy)'] }
];

export const getQuestionBank = async (req, res, next) => {
  try {
    // In the future, we can fetch this from a database collection
    res.json({ status: 'success', data: { questions: questionBank } });
  } catch (error) {
    next(error);
  }
};
