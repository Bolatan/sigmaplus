import { generateChart } from '../chartGenerator.js';

export default class CoreInsightAreas {
  constructor(processedData) {
    this.processedData = processedData;
  }

  async generate() {
    console.log('Generating core insight areas section...');

    const { summaryStatistics } = this.processedData;

    const charts = [];
    for (const questionId in summaryStatistics) {
      const chartData = {
        labels: ['Count'],
        datasets: [
          {
            label: `Question ${questionId}`,
            data: [summaryStatistics[questionId].count],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
      const chart = await generateChart(chartData);
      charts.push({
        title: `Question ${questionId}`,
        chart,
      });
    }

    return {
      title: 'Core Insight Areas',
      content: [
        {
          title: 'Brand Awareness & Perception',
          content: '',
        },
        {
          title: 'Brand Usage & Purchase Behavior',
          content: '',
        },
        {
          title: 'Customer Satisfaction & Loyalty Metrics',
          content: '',
        },
        {
          title: 'Challenges and Improvement Opportunities',
          content: '',
        },
        {
          title: 'Outlet Dynamics',
          content: '',
        },
        {
          title: 'Product Stocking, Restocking Behavior',
          content: '',
        },
        {
          title: 'Supply Methods and Barriers',
          content: '',
        },
        {
          title: 'Trade Margins & Pricing',
          content: '',
        },
        {
          title: 'Trade Customer Lifecycle & Support',
          content: '',
        },
        {
          title: 'Drivers of Purchase',
          content: '',
        },
        {
          title: 'Marketing Channels and Awareness Sources',
          content: '',
        },
        {
          title: 'CSAT, NPS, CES (Customer Effort Score)',
          content: '',
        },
        ...charts,
      ],
    };
  }
}
