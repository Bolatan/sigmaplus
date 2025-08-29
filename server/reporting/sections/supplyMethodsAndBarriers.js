import chartGenerator from '../chartGenerator.js';

export default class SupplyMethodsAndBarriers {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.processedData = dataProcessor.process();
    this.chartGenerator = new chartGenerator();
  }

  async generate() {
    console.log('Generating supply methods and barriers section...');

    const questionAnalysis = this.processedData.questionAnalysis;

    const supplyMethodData = questionAnalysis['supply_method']?.summary.breakdown || {};
    const supplyBarriersData = questionAnalysis['supply_barriers']?.summary.breakdown || {};

    const content = [
      {
        title: 'Supply Methods',
        content: 'This chart shows the different methods used to supply the product.',
        chart: await this.chartGenerator.generateChart({
          type: 'pie',
          data: {
            labels: Object.keys(supplyMethodData),
            datasets: [{
              label: 'Supply Methods',
              data: Object.values(supplyMethodData),
            }]
          }
        }),
      },
      {
        title: 'Barriers to Supply',
        content: 'This chart shows the main barriers to a consistent supply of the product.',
        chart: await this.chartGenerator.generateChart({
          type: 'bar',
          data: {
            labels: Object.keys(supplyBarriersData),
            datasets: [{
              label: 'Supply Barriers',
              data: Object.values(supplyBarriersData),
            }]
          }
        }),
      },
    ];

    return {
      title: 'Supply Methods and Barriers',
      content,
    };
  }
}
