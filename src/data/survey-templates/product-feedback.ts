import { SurveyQuestion } from '../../types';

export const productFeedbackTemplate: SurveyQuestion[] = [
  {
    id: '1',
    text: 'Which of the following words would you use to describe our product?',
    type: 'multiple-choice',
    options: ['Reliable', 'High-quality', 'Useful', 'Unique', 'Good value for money'],
    isRequired: true,
  },
  {
    id: '2',
    text: 'How well does our product meet your needs?',
    type: 'rating',
    maxRating: 5,
    isRequired: true,
  },
  {
    id: '3',
    text: 'What is the primary benefit that you have received from our product?',
    type: 'textarea',
    isRequired: false,
  },
];
