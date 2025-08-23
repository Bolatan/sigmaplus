// server/reporting/dataProcessor.js
export default class DataProcessor {
  constructor(clientData) {
    this.clientData = clientData;
    this.responses = clientData.responses || [];
    this.survey = clientData.survey || {};
    this.processedData = null; // To cache processed data
  }

  // Main processing method, can be called to cache results
  process() {
    if (this.processedData) {
      return this.processedData;
    }

    console.log('Processing data for reporting...');

    this.processedData = {
      totalResponses: this.responses.length,
      demographicsProfile: this.getDemographicsProfile(),
      questionAnalysis: this.analyzeQuestions(),
    };

    return this.processedData;
  }

  getDemographicsProfile() {
    const profile = {
      location: {},
      gender: {},
      age: {},
      occupation: {},
      income: {},
      outletType: {},
    };

    if (!this.responses || this.responses.length === 0) {
      return profile;
    }

    this.responses.forEach(response => {
      // Aggregate location data (assuming location is an object with city/state)
      if (response.location && response.location.state) {
        const state = response.location.state;
        profile.location[state] = (profile.location[state] || 0) + 1;
      }

      // Aggregate demographics data
      if (response.demographics) {
        Object.keys(profile).forEach(key => {
          if (key !== 'location' && response.demographics[key]) {
            const value = response.demographics[key];
            profile[key][value] = (profile[key][value] || 0) + 1;
          }
        });
      }
    });

    return profile;
  }

  analyzeQuestions() {
    const analysis = {};
    const questions = this.survey.questions || [];

    questions.forEach(question => {
      analysis[question.id] = {
        text: question.text,
        type: question.type,
        responses: [],
        summary: {},
      };
    });

    this.responses.forEach(response => {
      if (response.responseData) {
        Object.entries(response.responseData).forEach(([questionId, answer]) => {
          if (analysis[questionId]) {
            analysis[questionId].responses.push(answer);
          }
        });
      }
    });

    // Generate summary statistics for each question
    Object.keys(analysis).forEach(questionId => {
      const question = analysis[questionId];
      const responses = question.responses;
      const summary = {
        total: responses.length,
        breakdown: {},
      };

      if (['single-choice', 'multiple-choice', 'rating'].includes(question.type)) {
        responses.flat().forEach(answer => {
          summary.breakdown[answer] = (summary.breakdown[answer] || 0) + 1;
        });
      }

      analysis[questionId].summary = summary;
    });

    return analysis;
  }
}
