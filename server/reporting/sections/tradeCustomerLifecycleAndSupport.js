import { getChartData } from '../utils.js';

export default class TradeCustomerLifecycleAndSupport {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const lifecycleData = getChartData(responses, survey, 'trade_customer_lifecycle');
    const supportData = getChartData(responses, survey, 'trade_customer_support');

    return {
      title: 'Trade Customer Lifecycle & Support',
      content: [
        {
          title: 'Trade Customer Lifecycle',
          content: 'Chart showing trade customer lifecycle.',
          chart: await this.generateChart(lifecycleData),
        },
        {
          title: 'Trade Customer Support',
          content: 'Chart showing trade customer support satisfaction.',
          chart: await this.generateChart(supportData),
        },
      ],
    };
  }
}
