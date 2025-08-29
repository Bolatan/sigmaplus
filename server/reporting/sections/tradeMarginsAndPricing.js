import chartGenerator from '../chartGenerator.js';

export default class TradeMarginsAndPricing {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.processedData = dataProcessor.process();
    this.chartGenerator = new chartGenerator();
  }

  async generate() {
    console.log('Generating trade margins and pricing section...');

    const questionAnalysis = this.processedData.questionAnalysis;

    const retailPrices = questionAnalysis['retail_price']?.responses.map(p => parseFloat(p)) || [];
    const wholesalePrices = questionAnalysis['wholesale_price']?.responses.map(p => parseFloat(p)) || [];

    const averageRetailPrice = this.calculateAverage(retailPrices);
    const averageWholesalePrice = this.calculateAverage(wholesalePrices);
    const averageMargin = averageRetailPrice - averageWholesalePrice;
    const averageMarginPercentage = (averageMargin / averageRetailPrice) * 100;

    const content = [
      {
        title: 'Average Prices and Margin',
        content: `
          - Average Retail Price: ${averageRetailPrice.toFixed(2)}
          - Average Wholesale Price: ${averageWholesalePrice.toFixed(2)}
          - Average Margin: ${averageMargin.toFixed(2)} (${averageMarginPercentage.toFixed(2)}%)
        `,
      },
      {
        title: 'Retail Price Distribution',
        content: 'This chart shows the distribution of retail prices.',
        chart: await this.generatePriceDistributionChart(retailPrices, 'Retail Price Distribution'),
      },
    ];

    return {
      title: 'Trade Margins & Pricing',
      content,
    };
  }

  calculateAverage(prices) {
    if (prices.length === 0) return 0;
    const sum = prices.reduce((a, b) => a + b, 0);
    return sum / prices.length;
  }

  async generatePriceDistributionChart(prices, title) {
    const priceCounts = prices.reduce((acc, price) => {
      const roundedPrice = Math.round(price / 10) * 10; // Group prices into buckets of 10
      acc[roundedPrice] = (acc[roundedPrice] || 0) + 1;
      return acc;
    }, {});

    return await this.chartGenerator.generateChart({
      type: 'bar',
      data: {
        labels: Object.keys(priceCounts),
        datasets: [{
          label: title,
          data: Object.values(priceCounts),
        }]
      }
    });
  }
}
