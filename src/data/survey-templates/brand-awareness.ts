import { SurveyQuestion } from '../../types';

export const brandAwarenessTemplate: SurveyQuestion[] = [
  {
    id: '1',
    text: 'Have you heard of our brand before?',
    type: 'single-choice',
    options: ['Yes', 'No'],
    isRequired: true,
  },
  {
    id: '2',
    text: 'How did you hear about us?',
    type: 'multiple-choice',
    options: ['Social media', 'TV ad', 'Friend or family', 'Other'],
    isRequired: true,
  },
  {
    id: '3',
    text: 'How would you describe our brand in one word?',
    type: 'text',
    isRequired: true,
  },
];
