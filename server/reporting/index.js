import DataProcessor from './dataProcessor.js';
import StudyOverview from './sections/studyOverview.js';
import RespondentProfile from './sections/respondentProfile.js';
import ExecutiveSummary from './sections/executiveSummary.js';
import CoreInsights from './sections/coreInsights.js';
import RegionalFindings from './sections/regionalFindings.js';
import Recommendations from './sections/recommendations.js';
import Presentation from './presentation.js';
import Exporter from './exporter.js';

export default class Reporting {
  constructor(data) {
    this.data = data;
  }

  async generateReport() {
    const { survey, responses, company, client, sections } = this.data;

    const presentation = new Presentation({
      title: survey.title,
      company,
      client,
      sections,
    }).generate();

    const exporter = new Exporter(presentation, this.data);
    await exporter.toPdf();
    await exporter.toExcel();

    await presentation.writeFile({ fileName: `${this.data.clientName}-report.pptx` });
    console.log('Report generated successfully.');
  }
}
