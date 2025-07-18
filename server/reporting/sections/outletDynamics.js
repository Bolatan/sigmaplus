import { getChartData } from '../utils.js';

export default class OutletDynamics {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const outletDynamicsData = getChartData(responses, survey, 'outlet_dynamics');

    return {
      title: 'Outlet Dynamics',
      content: [
        {
          title: 'Outlet Dynamics',
          content: 'Chart showing outlet dynamics.',
          chart: await this.generateChart(outletDynamicsData),
        },
      ],
    };
  }
}
