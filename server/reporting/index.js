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
  constructor(clientData) {
    this.clientData = clientData;
  }

  async generateReport() {
    // 1. Process data
    const dataProcessor = new DataProcessor(this.clientData);
    const processedData = dataProcessor.process();

    // 2. Generate each section
    const sections = [
      new StudyOverview(processedData).generate(),
      new RespondentProfile(processedData).generate(),
      new ExecutiveSummary(processedData).generate(),
      new CoreInsights(processedData).generate(),
      new RegionalFindings(processedData).generate(),
      new Recommendations(processedData).generate(),
    ];

    // 3. Create PowerPoint presentation
    const presentation = new Presentation({ sections }).generate();

    // 4. Export to PDF and Excel
    const exporter = new Exporter(presentation, this.clientData);
    await exporter.toPdf();
    exporter.toExcel();

    // Save the presentation
    await presentation.writeFile({ fileName: `${this.clientData.clientName}-report.pptx` });

    console.log("Report generated successfully.");
  }
}
