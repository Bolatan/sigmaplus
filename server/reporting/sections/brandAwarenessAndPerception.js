import { getChartData } from '../utils.js';

export default class BrandAwarenessAndPerception {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const brandAwarenessData = getChartData(responses, survey, 'brand_awareness');
    const brandPerceptionData = getChartData(responses, survey, 'brand_perception');

    return {
      title: 'Brand Awareness & Perception',
      content: [
        {
          title: 'Brand Awareness',
          content: 'Chart showing brand awareness levels.',
          chart: await this.generateChart(brandAwarenessData),
        },
        {
          title: 'Brand Perception',
          content: 'Chart showing brand perception.',
          chart: await this.generateChart(brandPerceptionData),
        },
      ],
    };
  }
}
