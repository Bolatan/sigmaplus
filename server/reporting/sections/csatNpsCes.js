import { getChartData } from '../utils.js';

export default class CsatNpsCes {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const csatData = getChartData(responses, survey, 'csat');
    const npsData = getChartData(responses, survey, 'nps');
    const cesData = getChartData(responses, survey, 'ces');

    return {
      title: 'CSAT, NPS, CES (Customer Effort Score)',
      content: [
        {
          title: 'CSAT',
          content: 'Chart showing CSAT scores.',
          chart: await this.generateChart(csatData),
        },
        {
          title: 'NPS',
          content: 'Chart showing NPS scores.',
          chart: await this.generateChart(npsData),
        },
        {
          title: 'CES',
          content: 'Chart showing CES scores.',
          chart: await this.generateChart(cesData),
        },
      ],
    };
  }
}
