import Reporting from './index.js';
import ChartGenerator from './chartGenerator.js';

// Mock dependencies
jest.mock('./dataProcessor.js', () => {
  return jest.fn().mockImplementation(() => {
    return {
      process: jest.fn().mockReturnValue({
        summaryStatistics: {
          q1: { count: 10 },
          q2: { count: 20 },
        },
        getTopChallenges: jest.fn().mockReturnValue(['Challenge 1', 'Challenge 2']),
        getImprovementOpportunities: jest.fn().mockReturnValue(['Opportunity 1', 'Opportunity 2']),
      }),
      generateChartForChallenges: jest.fn().mockReturnValue('base64-encoded-chart'),
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
    expect(report.sections.length).toBe(8);
    expect(report.sections[0].title).toBe('Study Overview');
    expect(report.sections[1].title).toBe('Respondent Profile');
    expect(report.sections[2].title).toBe('Executive Summary');
    expect(report.sections[3].title).toBe('Brand Awareness & Perception');
    expect(report.sections[4].title).toBe('Brand Usage & Purchase Behavior');
    expect(report.sections[5].title).toBe('Core Insight Areas');
    expect(report.sections[6].title).toBe('Regional and Outlet-Level Findings');
    expect(report.sections[7].title).toBe('Recommendations');

    // Check the Core Insight Areas section
    const coreInsightAreas = report.sections[5];
    expect(coreInsightAreas.content.length).toBe(12); // 10 subsections + 2 charts
  });
});
