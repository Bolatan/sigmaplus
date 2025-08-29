import chartGenerator from '../chartGenerator.js';

export default class BrandUsageAndPurchaseBehavior {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.processedData = dataProcessor.process();
    this.chartGenerator = new chartGenerator();
  }

  async generate() {
    console.log('Generating brand usage and purchase behavior section...');

    const questionAnalysis = this.processedData.questionAnalysis;

    // The following question IDs are assumed. In a real application, these would
    // need to be mapped from the survey definition.
    const brandAwarenessData = questionAnalysis['brand_awareness']?.summary.breakdown || {};
    const brandConsiderationData = questionAnalysis['brand_consideration']?.summary.breakdown || {};
    const brandUsageData = questionAnalysis['brand_usage']?.summary.breakdown || {};
    const purchaseFrequencyData = questionAnalysis['purchase_frequency']?.summary.breakdown || {};
    const purchaseLocationData = questionAnalysis['purchase_location']?.summary.breakdown || {};

    const content = [
      {
        title: 'Brand Funnel',
        content: `This section analyzes the brand funnel from awareness to usage.`,
        chart: await this.generateBrandFunnelChart(brandAwarenessData, brandConsiderationData, brandUsageData),
      },
      {
        title: 'Frequency of Purchase',
        content: `This section shows how often consumers purchase the product.`,
        chart: await this.chartGenerator.generateChart({
          type: 'bar',
          data: {
            labels: Object.keys(purchaseFrequencyData),
            datasets: [{
              label: 'Frequency of Purchase',
              data: Object.values(purchaseFrequencyData),
            }]
          }
        }),
      },
      {
        title: 'Purchase Channels',
        content: `This section shows where consumers purchase the product.`,
        chart: await this.chartGenerator.generateChart({
          type: 'pie',
          data: {
            labels: Object.keys(purchaseLocationData),
            datasets: [{
              label: 'Purchase Channels',
              data: Object.values(purchaseLocationData),
            }]
          }
        }),
      },
    ];

    return {
      title: 'Brand Usage & Purchase Behavior',
      content,
    };
  }

  async generateBrandFunnelChart(awareness, consideration, usage) {
    // In a real implementation, this would use a charting library to generate an image
    // For now, we'll just return the data.
    return await this.chartGenerator.generateChart({
      type: 'funnel',
      data: {
        labels: ['Awareness', 'Consideration', 'Usage'],
        datasets: [
          {
            label: 'Brand Funnel',
            data: [
              Object.values(awareness).reduce((a, b) => a + b, 0),
              Object.values(consideration).reduce((a, b) => a + b, 0),
              Object.values(usage).reduce((a, b) => a + b, 0),
            ],
          },
        ],
      },
    });
  }
}
