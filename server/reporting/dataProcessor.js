// server/reporting/dataProcessor.js
import chartGenerator from './chartGenerator.js';

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
      region: {},
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

  getTopChallenges(limit = 5) {
    const challengesResponses = this.processedData.questionAnalysis['challenges']?.responses || [];
    return this.extractTopKeywords(challengesResponses, limit);
  }

  getImprovementOpportunities(limit = 5) {
    const suggestionsResponses = this.processedData.questionAnalysis['suggestions']?.responses || [];
    return this.extractTopKeywords(suggestionsResponses, limit);
  }

  async generateChartForChallenges(limit = 5) {
    const challengesResponses = this.processedData.questionAnalysis['challenges']?.responses || [];
    const keywords = this.extractTopKeywords(challengesResponses, limit, true);

    const chartData = {
      type: 'bar',
      data: {
        labels: Object.keys(keywords),
        datasets: [{
          label: 'Top Challenges',
          data: Object.values(keywords),
        }]
      }
    };

    const cg = new chartGenerator();
    return await cg.generateChart(chartData);
  }

  extractTopKeywords(responses, limit, returnFrequencies = false) {
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'is', 'it', 'in', 'on', 'at', 'to', 'for', 'with', 'of', 'i', 'you', 'he', 'she', 'they', 'we', 'our', 'your', 'their', 'my', 'mine']);
    const wordFrequencies = {};

    responses.forEach(response => {
      const words = response.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
      words.forEach(word => {
        if (word && !stopWords.has(word)) {
          wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        }
      });
    });

    const sortedKeywords = Object.entries(wordFrequencies).sort((a, b) => b[1] - a[1]);

    if (returnFrequencies) {
      return Object.fromEntries(sortedKeywords.slice(0, limit));
    } else {
      return sortedKeywords.slice(0, limit).map(entry => entry[0]);
    }
  }
}
