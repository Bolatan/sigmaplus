import { getChartData } from '../utils.js';

export default class ProductStockingAndRestocking {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const stockingData = getChartData(responses, survey, 'product_stocking');
    const restockingData = getChartData(responses, survey, 'product_restocking');

    return {
      title: 'Product Stocking, Restocking Behavior',
      content: [
        {
          title: 'Product Stocking',
          content: 'Chart showing product stocking behavior.',
          chart: await this.generateChart(stockingData),
        },
        {
          title: 'Product Restocking',
          content: 'Chart showing product restocking behavior.',
          chart: await this.generateChart(restockingData),
        },
      ],
    };
  }
}
