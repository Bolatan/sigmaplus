export default class ExecutiveSummary {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  generate() {
    const { summary } = this.processedData;
    return {
      title: 'Executive Summary',
      content: summary || 'No summary available.',
    };
  }
}
