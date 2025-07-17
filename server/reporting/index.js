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
    const sectionGenerators = [
      new StudyOverview(processedData),
      new RespondentProfile(processedData),
      new ExecutiveSummary(processedData),
      new CoreInsightAreas(processedData),
      new RegionalAndOutletLevelFindings(processedData),
      new Recommendations(processedData),
    ];

    const sections = await Promise.all(
      (this.clientData.sections || sectionGenerators).map(generator => generator.generate())
    );

    return {
      sections,
      summary: 'This is a summary of the report.',
    };
  }
}
