import { getChartData } from '../utils.js';

export default class CustomerSatisfactionAndLoyalty {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const satisfactionData = getChartData(responses, survey, 'customer_satisfaction');
    const loyaltyData = getChartData(responses, survey, 'customer_loyalty');

    return {
      title: 'Customer Satisfaction & Loyalty',
      content: [
        {
          title: 'Customer Satisfaction',
          content: 'Chart showing customer satisfaction levels.',
          chart: await this.generateChart(satisfactionData),
        },
        {
          title: 'Customer Loyalty',
          content: 'Chart showing customer loyalty levels.',
          chart: await this.generateChart(loyaltyData),
        },
      ],
    };
  }
}
