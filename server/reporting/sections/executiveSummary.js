export default class ExecutiveSummary {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.survey = dataProcessor.survey;
  }

  generate() {
    console.log('Generating executive summary section...');
    const processedData = this.dataProcessor.process();
    const totalResponses = processedData.totalResponses;

    let keyFinding = 'No key finding could be determined.';

    // Find the first single-choice question to derive a key finding
    const firstSingleChoiceQuestion = this.survey.questions?.find(q => q.type === 'single-choice');

    if (firstSingleChoiceQuestion && processedData.questionAnalysis[firstSingleChoiceQuestion.id]) {
      const analysis = processedData.questionAnalysis[firstSingleChoiceQuestion.id];
      const breakdown = analysis.summary.breakdown;

      if (Object.keys(breakdown).length > 0) {
        // Find the most frequent answer
        const mostFrequentAnswer = Object.entries(breakdown).reduce((a, b) => b[1] > a[1] ? b : a);
        const percentage = ((mostFrequentAnswer[1] / analysis.summary.total) * 100).toFixed(1);

        keyFinding = `A key insight from the survey is regarding the question: "${firstSingleChoiceQuestion.text}". The most common response was "${mostFrequentAnswer[0]}", chosen by ${percentage}% of respondents.`;
      }
    }

    const summaryContent = `
The study successfully gathered feedback from ${totalResponses} respondents, providing a robust dataset for analysis.
The data reveals several key trends and insights into the target market's perceptions and behaviors.

${keyFinding}

Further details on respondent demographics, brand perception, and other core insight areas are provided in the subsequent sections of this report.
These findings form the basis for the strategic recommendations outlined at the conclusion.
    `.trim().replace(/^\s+/gm, ''); // Clean up indentation

    return {
      title: 'Executive Summary',
      // The executive summary is typically a single block of text.
      // The content model can be just a string here.
      // If the template expects an array of objects, we wrap it.
      content: [{
        title: 'Key Highlights and Topline Insights',
        content: summaryContent,
      }],
    };
  }
}
