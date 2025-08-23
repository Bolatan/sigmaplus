import { generateChart } from '../chartGenerator.js';

export default class BrandAwarenessAndPerception {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.survey = dataProcessor.survey;
    this.questionAnalysis = dataProcessor.process().questionAnalysis;
  }

  async generate() {
    console.log('Generating brand awareness and perception section...');

    const keywords = ['brand', 'aware', 'awareness', 'perception', 'recall', 'recognize'];
    const relevantQuestions = (this.survey.questions || []).filter(q =>
      keywords.some(keyword => q.text.toLowerCase().includes(keyword))
    );

    if (relevantQuestions.length === 0) {
      return {
        title: 'Brand Awareness & Perception',
        content: 'No questions related to brand awareness or perception were found in this survey.',
      };
    }

    const content = [];
    for (const question of relevantQuestions) {
      const analysis = this.questionAnalysis[question.id];
      if (!analysis || analysis.summary.total === 0) continue;

      let summaryText = `For the question "${question.text}", there were ${analysis.summary.total} responses. `;
      const breakdown = analysis.summary.breakdown;
      const breakdownText = Object.entries(breakdown)
        .map(([answer, count]) => `${answer}: ${count} (${((count / analysis.summary.total) * 100).toFixed(1)}%)`)
        .join(', ');

      summaryText += `The breakdown of answers was as follows: ${breakdownText}.`;

      // Generate a chart for the first question we analyze
      let chartImage = null;
      if (content.length === 0 && Object.keys(breakdown).length > 0) {
        const chartData = {
          labels: Object.keys(breakdown),
          datasets: [{
            label: 'Response Count',
            data: Object.values(breakdown),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          }],
        };
        chartImage = await generateChart(chartData);
      }

      content.push({
        title: question.text,
        content: summaryText,
        ...(chartImage && { chart: chartImage }),
      });
    }

    return {
      title: 'Brand Awareness & Perception',
      content: content.length > 0 ? content : [{ title: 'No relevant responses found for this section.', content: '' }],
    };
  }
}
