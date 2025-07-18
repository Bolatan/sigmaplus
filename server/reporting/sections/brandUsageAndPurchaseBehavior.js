import { getChartData } from '../utils.js';

export default class BrandUsageAndPurchaseBehavior {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const brandUsageData = getChartData(responses, survey, 'brand_usage');
    const purchaseBehaviorData = getChartData(responses, survey, 'purchase_behavior');

    return {
      title: 'Brand Usage & Purchase Behavior',
      content: [
        {
          title: 'Brand Usage',
          content: 'Chart showing brand usage frequency.',
          chart: await this.generateChart(brandUsageData),
        },
        {
          title: 'Purchase Behavior',
          content: 'Chart showing purchase behavior.',
          chart: await this.generateChart(purchaseBehaviorData),
        },
      ],
    };
  }
}
