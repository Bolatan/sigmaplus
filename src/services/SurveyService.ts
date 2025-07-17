import { Survey } from '../types/survey';

const surveys: Survey[] = [];

export const SurveyService = {
  getAll: async (): Promise<Survey[]> => {
    return surveys;
  },

  getById: async (id: string): Promise<Survey | undefined> => {
    return surveys.find((survey) => survey.id === id);
  },

  create: async (survey: Survey): Promise<Survey> => {
    surveys.push(survey);
    return survey;
  },

  update: async (id: string, updatedSurvey: Survey): Promise<Survey | undefined> => {
    const index = surveys.findIndex((survey) => survey.id === id);
    if (index !== -1) {
      surveys[index] = updatedSurvey;
      return updatedSurvey;
    }
    return undefined;
  },

  delete: async (id: string): Promise<void> => {
    const index = surveys.findIndex((survey) => survey.id === id);
    if (index !== -1) {
      surveys.splice(index, 1);
    }
  },
};
