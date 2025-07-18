import { getChartData } from '../utils.js';

export default class MarketingChannelsAndAwarenessSources {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  async generate() {
    const { responses, survey } = this.processedData;

    const marketingChannelsData = getChartData(responses, survey, 'marketing_channels');
    const awarenessSourcesData = getChartData(responses, survey, 'awareness_sources');

    return {
      title: 'Marketing Channels and Awareness Sources',
      content: [
        {
          title: 'Marketing Channels',
          content: 'Chart showing marketing channels.',
          chart: await this.generateChart(marketingChannelsData),
        },
        {
          title: 'Awareness Sources',
          content: 'Chart showing awareness sources.',
          chart: await this.generateChart(awarenessSourcesData),
        },
      ],
    };
  }
}
