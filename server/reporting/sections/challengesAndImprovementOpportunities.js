import { getChartData } from '../utils.js';

export default class ChallengesAndImprovementOpportunities {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const challengesData = getChartData(responses, survey, 'challenges');
    const improvementData = getChartData(responses, survey, 'improvement_opportunities');

    return {
      title: 'Challenges and Improvement Opportunities',
      content: [
        {
          title: 'Challenges',
          content: 'Chart showing top challenges.',
          chart: await this.generateChart(challengesData),
        },
        {
          title: 'Improvement Opportunities',
          content: 'Chart showing top improvement opportunities.',
          chart: await this.generateChart(improvementData),
        },
      ],
    };
  }
}
