import Reporting from './index.js';
import ChartGenerator from './chartGenerator.js';

// Mock dependencies
jest.mock('./dataProcessor.js', () => {
  return jest.fn().mockImplementation((clientData) => { // Accept clientData
    return {
      clientData: clientData, // Pass clientData through
      survey: clientData.survey, // Pass survey through for generators that use it
      process: jest.fn().mockReturnValue({
        totalResponses: clientData.responses.length,
        questionAnalysis: {}, // Mocked empty for now
        getTopChallenges: jest.fn().mockReturnValue(['Mock Challenge 1']),
        getImprovementOpportunities: jest.fn().mockReturnValue(['Mock Opportunity 1']),
        summaryStatistics: { 'q1': { count: 10 }, 'q2': { count: 20 } },
      }),
      getDemographicsProfile: jest.fn().mockReturnValue({
        location: { 'State A': 1, 'State B': 1 },
        gender: { 'Male': 1, 'Female': 1 },
      }),
      generateChartForChallenges: jest.fn().mockResolvedValue('base64-encoded-chart'),
    };
  });
});

jest.mock('./chartGenerator.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => {
    return {
      generateChart: jest.fn().mockResolvedValue('base64-encoded-chart'),
    };
  }),
  generateChart: jest.fn().mockResolvedValue('base64-encoded-chart'),
}));

describe('Reporting', () => {
  it('should generate a report with all sections', async () => {
    const clientData = {
      survey: { title: 'Test Survey' },
      responses: [],
      user: { name: 'Test User' },
      company: { name: 'Test Company' },
      title: 'Test Report',
      sections: undefined, // Let the Reporting class generate all sections
    };

    const reporting = new Reporting(clientData);
    const report = await reporting.generateReport();

    // Check for the presence of all sections
    expect(report.sections.length).toBe(6);
    expect(report.sections[0].title).toBe('Study Overview');
    expect(report.sections[1].title).toBe('Respondent Profile');
    expect(report.sections[2].title).toBe('Executive Summary');
    expect(report.sections[3].title).toBe('Core Insight Areas');
    expect(report.sections[4].title).toBe('Regional and Outlet-Level Findings');
    expect(report.sections[5].title).toBe('Recommendations');

    // Check the Core Insight Areas section
    const coreInsightAreas = report.sections[3];
    expect(coreInsightAreas.content.length).toBe(14); // 12 subsections + 2 charts
  });
});
