import DataProcessor from './dataProcessor.js';
import StudyOverview from './sections/studyOverview.js';
import RespondentProfile from './sections/respondentProfile.js';
import ExecutiveSummary from './sections/executiveSummary.js';
import CoreInsightAreas from './sections/coreInsightAreas.js';
import RegionalAndOutletLevelFindings from './sections/regionalAndOutletLevelFindings.js';
import Recommendations from './sections/recommendations.js';
import Presentation from './presentation.js';

export default class Reporting {
  constructor(clientData) {
    this.clientData = clientData;
  }

  async generateReport() {
    // 1. Process data
    const dataProcessor = new DataProcessor(this.clientData);
    const processedData = dataProcessor.process();

    // 2. Generate each section
    const sections = this.clientData.sections || [
      new StudyOverview(processedData).generate(),
      new RespondentProfile(processedData).generate(),
      new ExecutiveSummary(processedData).generate(),
      new CoreInsightAreas(processedData).generate(),
      new RegionalAndOutletLevelFindings(processedData).generate(),
      new Recommendations(processedData).generate(),
    ];

    return {
      sections,
      summary: 'This is a summary of the report.',
    };
  }
}
