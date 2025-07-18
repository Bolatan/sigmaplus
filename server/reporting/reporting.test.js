import Reporting from './index.js';
import { defaultTemplate } from './templates.js';

jest.mock('./dataProcessor.js', () => {
  return jest.fn().mockImplementation(() => {
    return {
      process: jest.fn().mockReturnValue({
        project: {
          name: 'Test Project',
          background: 'Test Background',
          objectives: 'Test Objectives',
          methodology: 'Test Methodology',
        },
        summary: 'Test Summary',
        responses: [],
        survey: {
          questions: [],
        },
      }),
    };
  });
});

jest.mock('./chartGenerator.js', () => ({
  generateChart: jest.fn().mockResolvedValue('base64-encoded-chart'),
}));

// Mock all section generators
jest.mock('./sections/studyOverview.js');
jest.mock('./sections/respondentProfile.js');
jest.mock('./sections/executiveSummary.js');
jest.mock('./sections/coreInsightAreas.js');
jest.mock('./sections/regionalAndOutletLevelFindings.js');
jest.mock('./sections/recommendations.js');

import StudyOverview from './sections/studyOverview.js';
import RespondentProfile from './sections/respondentProfile.js';
import ExecutiveSummary from './sections/executiveSummary.js';
import CoreInsightAreas from './sections/coreInsightAreas.js';
import RegionalAndOutletLevelFindings from './sections/regionalAndOutletLevelFindings.js';
import Recommendations from './sections/recommendations.js';

describe('Reporting', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and methods before each test
    StudyOverview.mockClear();
    RespondentProfile.mockClear();
    ExecutiveSummary.mockClear();
    CoreInsightAreas.mockClear();
    RegionalAndOutletLevelFindings.mockClear();
    Recommendations.mockClear();
  });

  it('should generate a report with all sections from the default template', async () => {
    const clientData = {
      survey: { title: 'Test Survey', questions: [] },
      responses: [],
      user: { name: 'Test User' },
      company: { name: 'Test Company' },
      title: 'Test Report',
      template: defaultTemplate,
      project: {},
    };

    // Mock the generate method for each section generator
    const mockGenerate = jest.fn().mockResolvedValue({ title: 'Mock Section', content: [] });
    StudyOverview.prototype.generate = mockGenerate;
    RespondentProfile.prototype.generate = mockGenerate;
    ExecutiveSummary.prototype.generate = mockGenerate;
    CoreInsightAreas.prototype.generate = mockGenerate;
    RegionalAndOutletLevelFindings.prototype.generate = mockGenerate;
    Recommendations.prototype.generate = mockGenerate;

    const reporting = new Reporting(clientData);
    const report = await reporting.generateReport();

    expect(report.sections.length).toBe(defaultTemplate.sections.length);
    expect(StudyOverview).toHaveBeenCalledTimes(1);
    expect(RespondentProfile).toHaveBeenCalledTimes(1);
    expect(ExecutiveSummary).toHaveBeenCalledTimes(1);
    expect(CoreInsightAreas).toHaveBeenCalledTimes(1);
    expect(RegionalAndOutletLevelFindings).toHaveBeenCalledTimes(1);
    expect(Recommendations).toHaveBeenCalledTimes(1);
  });
});
