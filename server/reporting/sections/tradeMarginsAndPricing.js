import { getChartData } from '../utils.js';

export default class TradeMarginsAndPricing {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const tradeMarginsData = getChartData(responses, survey, 'trade_margins');
    const pricingData = getChartData(responses, survey, 'pricing');

    return {
      title: 'Trade Margins & Pricing',
      content: [
        {
          title: 'Trade Margins',
          content: 'Chart showing trade margins.',
          chart: await this.generateChart(tradeMarginsData),
        },
        {
          title: 'Pricing',
          content: 'Chart showing pricing information.',
          chart: await this.generateChart(pricingData),
        },
      ],
    };
  }
}
