import chartGenerator from '../chartGenerator.js';

export default class TradeCustomerLifecycleAndSupport {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.processedData = dataProcessor.process();
    this.chartGenerator = new chartGenerator();
  }

  async generate() {
    console.log('Generating trade customer lifecycle and support section...');

    const questionAnalysis = this.processedData.questionAnalysis;

    const acquisitionChannelData = questionAnalysis['acquisition_channel']?.summary.breakdown || {};
    const supportChannelPreferenceData = questionAnalysis['support_channel_preference']?.summary.breakdown || {};
    const supportSatisfactionScores = questionAnalysis['support_satisfaction']?.responses || [];

    const averageSupportSatisfaction = this.calculateAverage(supportSatisfactionScores);

    const content = [
      {
        title: 'Customer Acquisition Channels',
        content: 'This chart shows how customers first heard about the product.',
        chart: await this.chartGenerator.generateChart({
          type: 'pie',
          data: {
            labels: Object.keys(acquisitionChannelData),
            datasets: [{
              label: 'Acquisition Channels',
              data: Object.values(acquisitionChannelData),
            }]
          }
        }),
      },
      {
        title: 'Preferred Support Channels',
        content: 'This chart shows the preferred channels for customer support.',
        chart: await this.chartGenerator.generateChart({
          type: 'bar',
          data: {
            labels: Object.keys(supportChannelPreferenceData),
            datasets: [{
              label: 'Preferred Support Channels',
              data: Object.values(supportChannelPreferenceData),
            }]
          }
        }),
      },
      {
        title: 'Satisfaction with Customer Support',
        content: `The average satisfaction score with customer support is ${averageSupportSatisfaction.toFixed(2)} out of 5.`,
        chart: await this.generateScoreDistributionChart(supportSatisfactionScores, 'Support Satisfaction'),
      },
    ];

    return {
      title: 'Trade Customer Lifecycle & Support',
      content,
    };
  }

  calculateAverage(scores) {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + parseInt(b, 10), 0);
    return sum / scores.length;
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
}
