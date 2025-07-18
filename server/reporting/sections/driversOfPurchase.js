import { getChartData } from '../utils.js';

export default class DriversOfPurchase {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const driversOfPurchaseData = getChartData(responses, survey, 'drivers_of_purchase');

    return {
      title: 'Drivers of Purchase',
      content: [
        {
          title: 'Drivers of Purchase',
          content: 'Chart showing drivers of purchase.',
          chart: await this.generateChart(driversOfPurchaseData),
        },
      ],
    };
  }
}
