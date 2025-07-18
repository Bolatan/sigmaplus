import DataProcessor from './dataProcessor.js';
import { defaultTemplate } from './templates.js';
import { generateChart } from './chartGenerator.js';
import StudyOverview from './sections/studyOverview.js';
import RespondentProfile from './sections/respondentProfile.js';
import ExecutiveSummary from './sections/executiveSummary.js';
import CoreInsightAreas from './sections/coreInsightAreas.js';
import RegionalAndOutletLevelFindings from './sections/regionalAndOutletLevelFindings.js';
import Recommendations from './sections/recommendations.js';

const sectionGenerators = {
  'Study Overview': StudyOverview,
  'Respondent Profile': RespondentProfile,
  'Executive Summary': ExecutiveSummary,
  'Core Insight Areas': CoreInsightAreas,
  'Regional and Outlet-Level Findings': RegionalAndOutletLevelFindings,
  Recommendations,
};

export default class Reporting {
  constructor(clientData) {
    this.clientData = clientData;
  }

  async generateReport() {
    // 1. Process data
    const dataProcessor = new DataProcessor(this.clientData);
    const processedData = dataProcessor.process();

    // 2. Get the report template
    const template = this.clientData.template || defaultTemplate;

    // 3. Populate the template with data
    const sections = await Promise.all(
      template.sections.map(async (section) => {
        const SectionGenerator = sectionGenerators[section.title];
        if (SectionGenerator) {
          const generator = new SectionGenerator(processedData, generateChart);
          return generator.generate();
        }
        return section;
      })
    );

    return {
      sections,
      summary: 'This is a summary of the report.',
    };
  }
}
