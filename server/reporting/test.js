import Reporting from './index.js';

const sampleData = {
  clientName: "Test Client",
  projectName: "Test Project",
  background: "This is a test project.",
  objectives: "To test the reporting framework.",
  methodology: "Agile development and testing.",
  respondentProfile: [
    { label: "Location", value: "Global" },
    { label: "Gender", value: "Mixed" },
  ],
  executiveSummary: "This is a test executive summary.",
  coreInsights: "These are test core insights.",
  regionalFindings: "These are test regional findings.",
  recommendations: "These are test recommendations.",
};

const report = new Reporting(sampleData);
report.generateReport();
