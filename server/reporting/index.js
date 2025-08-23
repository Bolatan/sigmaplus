import DataProcessor from './dataProcessor.js';
import { defaultTemplate } from './templates.js';

// Import all section generator classes
import StudyOverview from './sections/studyOverview.js';
import RespondentProfile from './sections/respondentProfile.js';
import ExecutiveSummary from './sections/executiveSummary.js';
import CoreInsightAreas from './sections/coreInsightAreas.js';
import RegionalAndOutletLevelFindings from './sections/regionalAndOutletLevelFindings.js';
import Recommendations from './sections/recommendations.js';
import BrandAwarenessAndPerception from './sections/brandAwarenessAndPerception.js';

// Map section IDs from the template to their corresponding generator classes
const sectionGenerators = {
  'study-overview': StudyOverview,
  'respondent-profile': RespondentProfile,
  'executive-summary': ExecutiveSummary,
  'core-insight-areas': CoreInsightAreas,
  'regional-and-outlet-level-findings': RegionalAndOutletLevelFindings,
  'recommendations': Recommendations,
  'brand-awareness-and-perception': BrandAwarenessAndPerception,
};

export default class Reporting {
  constructor(clientData) {
    this.clientData = clientData;
  }

  async generateReport() {
    // 1. Initialize data processor
    const dataProcessor = new DataProcessor(this.clientData);
    const { responses, company } = this.clientData;

    // 2. Get the report template
    const template = this.clientData.template || defaultTemplate;

    // 3. Populate the template with dynamically generated content
    const sections = await Promise.all(
      template.sections.map(async (sectionConfig) => {
        const GeneratorClass = sectionGenerators[sectionConfig.id];
        if (GeneratorClass) {
          let generator;
          // Special handling for sections that need raw data
          if (sectionConfig.id === 'brand-awareness-and-perception') {
            generator = new GeneratorClass({ responses, company });
          } else {
            // Pass the entire dataProcessor instance to other generators
            generator = new GeneratorClass(dataProcessor);
          }
          return generator.generate();
        }
        // If no generator is found, return the static section from the template
        return sectionConfig;
      })
    );

    return {
      title: this.clientData.title || 'Report',
      sections,
      summary: 'This is a summary of the report.', // Placeholder summary
    };
  }
}
