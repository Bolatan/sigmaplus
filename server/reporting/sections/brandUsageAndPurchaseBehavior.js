// A helper function to count occurrences of items in an array
const countOccurrences = (arr) => {
  return arr.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});
};

export default class BrandUsageAndPurchaseBehavior {
  constructor({ responses, company }) {
    this.responses = responses || [];
    this.company = company;
    this.totalRespondents = this.responses.length;
  }

  generate() {
    console.log('Generating brand usage and purchase behavior section...');

    // --- Data Processing ---
    // Assumptions about survey question IDs: 'purchase_frequency', 'last_brand_purchased', 'drivers_of_purchase'
    const ourBrandName = this.company?.name || 'Signa Plus';

    // 1. Analyze Purchase Frequency
    const frequencies = this.responses.map(r => r.data?.purchase_frequency).filter(Boolean);
    const frequencyCounts = countOccurrences(frequencies);

    // 2. Analyze Last Brand Purchased
    const lastPurchased = this.responses.map(r => r.data?.last_brand_purchased).filter(Boolean);
    const lastPurchasedCounts = countOccurrences(lastPurchased);
    const ourBrandLastPurchased = lastPurchasedCounts[ourBrandName] || 0;

    // 3. Analyze Drivers of Purchase
    const allDrivers = this.responses.flatMap(r => r.data?.drivers_of_purchase || []);
    const driverCounts = countOccurrences(allDrivers);
    const topDrivers = Object.entries(driverCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([driver, count]) => `${driver} (${count} mentions)`);

    // --- Structuring Content for the Report ---
    return {
      title: 'Brand Usage & Purchase Behavior',
      content: [
        {
          title: 'Purchase Frequency',
          content: `Analysis of how often ${this.totalRespondents} respondents make purchases in this category.`,
          chartData: {
            type: 'bar',
            data: {
              labels: Object.keys(frequencyCounts),
              datasets: [{
                label: 'Number of Respondents',
                data: Object.values(frequencyCounts),
              }],
            },
          },
        },
        {
          title: 'Last Brand Purchased',
          content: `${ourBrandLastPurchased} out of ${this.totalRespondents} respondents who answered last purchased "${ourBrandName}".`,
          chartData: {
            type: 'pie',
            data: {
              labels: Object.keys(lastPurchasedCounts),
              datasets: [{
                data: Object.values(lastPurchasedCounts),
              }],
            },
          },
        },
        {
          title: 'Key Drivers of Purchase',
          content: `The top factors influencing purchase decisions were: ${topDrivers.join(', ') || 'N/A'}.`,
        },
      ],
    };
  }
}
