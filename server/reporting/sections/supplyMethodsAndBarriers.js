import { getChartData } from '../utils.js';

export default class SupplyMethodsAndBarriers {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const supplyMethodsData = getChartData(responses, survey, 'supply_methods');
    const supplyBarriersData = getChartData(responses, survey, 'supply_barriers');

    return {
      title: 'Supply Methods and Barriers',
      content: [
        {
          title: 'Supply Methods',
          content: 'Chart showing supply methods.',
          chart: await this.generateChart(supplyMethodsData),
        },
        {
          title: 'Supply Barriers',
          content: 'Chart showing supply barriers.',
          chart: await this.generateChart(supplyBarriersData),
        },
      ],
    };
  }
}
