export default class DataProcessor {
  constructor(clientData) {
    this.clientData = clientData;
    this.summaryStatistics = {};
    this.processed = false;
  }

  process() {
    if (this.processed) return this;
    console.log('Processing data...');

    const { responses } = this.clientData;
    if (!responses) return this;

    const responsesByQuestion = {};
    responses.forEach(response => {
      if (response.answers && Array.isArray(response.answers)) {
        response.answers.forEach(answer => {
          if (!responsesByQuestion[answer.questionId]) {
            responsesByQuestion[answer.questionId] = [];
          }
          responsesByQuestion[answer.questionId].push(answer.value);
        });
      }
    });

    for (const questionId in responsesByQuestion) {
      const values = responsesByQuestion[questionId];
      this.summaryStatistics[questionId] = {
        count: values.length,
      };
    }

    this.processed = true;
    return this;
  }

  getTopChallenges(limit = 5) {
    // Assuming a question with ID 'challenges' exists
    const challenges = this.clientData.responses
      .map(r => r.data?.challenges)
      .filter(Boolean);

    const counts = challenges.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([challenge]) => challenge);
  }

  getImprovementOpportunities(limit = 5) {
    // Assuming a question with ID 'improvements' exists
    const improvements = this.clientData.responses
      .map(r => r.data?.improvements)
      .filter(Boolean);

    const counts = improvements.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([improvement]) => improvement);
  }

  generateChartForChallenges() {
    // Placeholder for chart generation logic
    return 'base64-placeholder-chart-for-challenges';
  }
}
