import chartGenerator from '../chartGenerator.js';

export default class ProductStockingAndRestocking {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.processedData = dataProcessor.process();
    this.chartGenerator = new chartGenerator();
  }

  async generate() {
    console.log('Generating product stocking and restocking behavior section...');

    const questionAnalysis = this.processedData.questionAnalysis;

    const stockStatusData = questionAnalysis['stock_status']?.summary.breakdown || {};
    const restockFrequencyData = questionAnalysis['restock_frequency']?.summary.breakdown || {};
    const supplierData = questionAnalysis['supplier']?.summary.breakdown || {};

    const content = [
      {
        title: 'Product Stock Status',
        content: 'This chart shows the current stock status of the product.',
        chart: await this.chartGenerator.generateChart({
          type: 'pie',
          data: {
            labels: Object.keys(stockStatusData),
            datasets: [{
              label: 'Stock Status',
              data: Object.values(stockStatusData),
            }]
          }
        }),
      },
      {
        title: 'Restocking Frequency',
        content: 'This chart shows how often the product is restocked.',
        chart: await this.chartGenerator.generateChart({
          type: 'bar',
          data: {
            labels: Object.keys(restockFrequencyData),
            datasets: [{
              label: 'Restocking Frequency',
              data: Object.values(restockFrequencyData),
            }]
          }
        }),
      },
      {
        title: 'Main Suppliers',
        content: 'This chart shows the main suppliers of the product.',
        chart: await this.chartGenerator.generateChart({
          type: 'bar',
          data: {
            labels: Object.keys(supplierData),
            datasets: [{
              label: 'Main Suppliers',
              data: Object.values(supplierData),
            }]
          }
        }),
      },
    ];

    return {
      title: 'Product Stocking, Restocking Behavior',
      content,
    };
  }
}
