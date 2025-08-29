// A helper function to safely calculate percentages
const calculatePercentage = (count, total) => {
  if (total === 0) return '0.0%';
  return ((count / total) * 100).toFixed(1) + '%';
};

export default class BrandAwarenessAndPerception {
  constructor({ responses, company }) {
    this.responses = responses || [];
    this.company = company; // The client's company
    this.totalRespondents = this.responses.length;
  }

  generate() {
    console.log('Generating brand awareness and perception section...');

    // --- Data Processing ---
    // We'll make assumptions about the survey question IDs, e.g., 'brand_recall_unaided', 'brand_recall_aided'.
    const ourBrandName = this.company?.name || 'Signa Plus';

    // Unaided Recall: Count how many mentioned our brand
    const unaidedMentions = this.responses.filter(r =>
      r.responseData?.brand_recall_unaided?.toLowerCase().includes(ourBrandName.toLowerCase())
    ).length;

    // Aided Recall: Count how many recognized our brand from a list
    const aidedRecognitions = this.responses.filter(r =>
      r.responseData?.brand_recall_aided && r.responseData.brand_recall_aided.includes(ourBrandName)
    ).length;

    // Perception Score: Average score for our brand (assuming a 1-5 scale)
    const perceptionScores = this.responses
      .map(r => r.responseData[`brand_perception_${ourBrandName.toLowerCase()}`])
      .filter(score => score && !isNaN(score));

    const averagePerception = perceptionScores.length > 0
      ? (perceptionScores.reduce((a, b) => a + Number(b), 0) / perceptionScores.length).toFixed(2)
      : 'N/A';

    // --- Structuring Content for the Report ---
    return {
      title: 'Brand Awareness & Perception',
      content: [
        {
          title: 'Key Highlights',
          content: `This section analyzes brand recall and perception among ${this.totalRespondents} respondents.`,
        },
        {
          title: 'Unaided Brand Recall',
          content: `When asked to name brands in the category, ${calculatePercentage(unaidedMentions, this.totalRespondents)} of respondents mentioned "${ourBrandName}".`,
          chartData: {
            type: 'bar',
            data: {
              labels: [ourBrandName, 'Other Brands'],
              datasets: [{
                label: 'Unaided Recall',
                data: [unaidedMentions, this.totalRespondents - unaidedMentions],
              }],
            },
          },
        },
        {
          title: 'Aided Brand Recall',
          content: `When shown a list of brands, ${calculatePercentage(aidedRecognitions, this.totalRespondents)} of respondents recognized "${ourBrandName}".`,
          chartData: {
            type: 'pie',
            data: {
              labels: ['Recognized', 'Did Not Recognize'],
              datasets: [{
                data: [aidedRecognitions, this.totalRespondents - aidedRecognitions],
              }],
            },
          },
        },
        {
          title: 'Brand Perception',
          content: `The average perception score for "${ourBrandName}" was ${averagePerception} out of 5.`,
        },
      ],

    };
  }
}
