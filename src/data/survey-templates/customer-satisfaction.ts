import { SurveyQuestion } from '../../types';

export const customerSatisfactionTemplate: SurveyQuestion[] = [
  {
    id: '1',
    text: 'How satisfied are you with our product/service?',
    type: 'rating',
    maxRating: 5,
    isRequired: true,
  },
  {
    id: '2',
    text: 'What did you like most about our product/service?',
    type: 'textarea',
    isRequired: false,
  },
  {
    id: '3',
    text: 'What could we do to improve our product/service?',
    type: 'textarea',
    isRequired: false,
  },
];
