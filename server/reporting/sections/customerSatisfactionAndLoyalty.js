import chartGenerator from '../chartGenerator.js';

export default class CustomerSatisfactionAndLoyalty {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.processedData = dataProcessor.process();
    this.chartGenerator = new chartGenerator();
  }

  async generate() {
    console.log('Generating customer satisfaction and loyalty section...');

    const questionAnalysis = this.processedData.questionAnalysis;

    const satisfactionScores = questionAnalysis['satisfaction_score']?.responses || [];
    const npsScores = questionAnalysis['nps_score']?.responses || [];
    const cesScores = questionAnalysis['ces_score']?.responses || [];
    const repurchaseLikelihoods = questionAnalysis['repurchase_likelihood']?.responses || [];

    const content = [
      {
        title: 'Overall Satisfaction (CSAT)',
        content: `The average satisfaction score is ${this.calculateAverage(satisfactionScores).toFixed(2)} out of 5.`,
        chart: await this.generateScoreDistributionChart(satisfactionScores, 'CSAT Score Distribution'),
      },
      {
        title: 'Net Promoter Score (NPS)',
        content: `The Net Promoter Score is ${this.calculateNps(npsScores)}.`,
        chart: await this.generateNpsChart(npsScores),
      },
      {
        title: 'Customer Effort Score (CES)',
        content: `The average Customer Effort Score is ${this.calculateAverage(cesScores).toFixed(2)} out of 5.`,
        chart: await this.generateScoreDistributionChart(cesScores, 'CES Score Distribution'),
      },
      {
        title: 'Likelihood to Repurchase',
        content: `The average likelihood to repurchase is ${this.calculateAverage(repurchaseLikelihoods).toFixed(2)} out of 5.`,
        chart: await this.generateScoreDistributionChart(repurchaseLikelihoods, 'Repurchase Likelihood'),
      },
    ];

    return {
      title: 'Customer Satisfaction & Loyalty',
      content,
    };
  }

  calculateAverage(scores) {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + parseInt(b, 10), 0);
    return sum / scores.length;
  }

  calculateNps(scores) {
    if (scores.length === 0) return 0;
    const promoters = scores.filter(score => score >= 9).length;
    const detractors = scores.filter(score => score <= 6).length;
    return Math.round(((promoters - detractors) / scores.length) * 100);
  }

  async generateScoreDistributionChart(scores, title) {
    const scoreCounts = scores.reduce((acc, score) => {
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {});

    return await this.chartGenerator.generateChart({
      type: 'bar',
      data: {
        labels: Object.keys(scoreCounts),
        datasets: [{
          label: title,
          data: Object.values(scoreCounts),
        }]
      }
    });
  }

  async generateNpsChart(scores) {
    const promoters = scores.filter(score => score >= 9).length;
    const passives = scores.filter(score => score >= 7 && score <= 8).length;
    const detractors = scores.filter(score => score <= 6).length;

    return await this.chartGenerator.generateChart({
      type: 'pie',
      data: {
        labels: ['Promoters', 'Passives', 'Detractors'],
        datasets: [{
          data: [promoters, passives, detractors],
          backgroundColor: ['#2ECC71', '#F1C40F', '#E74C3C'],
        }]
      }
    });
  }
}
