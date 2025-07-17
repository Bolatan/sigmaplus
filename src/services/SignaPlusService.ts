// TODO: Connect this service to the real SignaPlus API

export interface SignaPlusQuestion {
  id: string;
  text: string;
  type: 'star' | 'ranking' | 'matrix' | 'multiple-choice' | 'open-ended';
  options?: string[];
}

export interface SignaPlusSurvey {
  id: string;
  title: string;
  questions: SignaPlusQuestion[];
}

export class SignaPlusService {
  private static surveys: SignaPlusSurvey[] = [
    {
      id: '1',
      title: 'Customer Satisfaction Survey',
      questions: [
        {
          id: '1',
          text: 'How satisfied are you with our product?',
          type: 'star',
        },
        {
          id: '2',
          text: 'Please rank the following features in order of importance.',
          type: 'ranking',
          options: ['Feature A', 'Feature B', 'Feature C'],
        },
        {
          id: '3',
          text: 'Please rate the following aspects of our service.',
          type: 'matrix',
          options: ['Quality', 'Price', 'Customer Support'],
        },
      ],
    },
  ];

  static async createSurveyWithAI(prompt: string): Promise<SignaPlusSurvey> {
    console.log(`Creating survey with AI using prompt: ${prompt}`);
    const newSurvey: SignaPlusSurvey = {
      id: String(SignaPlusService.surveys.length + 1),
      title: 'New Survey',
      questions: [
        {
          id: '1',
          text: 'This is an AI-generated question.',
          type: 'multiple-choice',
          options: ['Option 1', 'Option 2', 'Option 3'],
        },
      ],
    };
    SignaPlusService.surveys.push(newSurvey);
    return newSurvey;
  }

  static async getSurvey(id: string): Promise<SignaPlusSurvey | undefined> {
    return SignaPlusService.surveys.find((survey) => survey.id === id);
  }

  static async addConditionalLogic(
    surveyId: string,
    questionId: string,
    condition: any
  ): Promise<void> {
    console.log(
      `Adding conditional logic to survey ${surveyId}, question ${questionId} with condition:`,
      condition
    );
  }

  static async addMultilingualSupport(
    surveyId: string,
    language: string
  ): Promise<void> {
    console.log(
      `Adding multilingual support to survey ${surveyId} for language: ${language}`
    );
  }
}
