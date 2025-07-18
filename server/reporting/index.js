import DataProcessor from './dataProcessor.js';
import { defaultTemplate } from './templates.js';
import { generateChart } from './chartGenerator.js';

export default class Reporting {
  constructor(clientData) {
    this.clientData = clientData;
    this.chartGenerator = { generateChart };
  }

  async generateReport() {
    const dataProcessor = new DataProcessor(this.clientData);
    const processedData = dataProcessor.process();
    const template = this.clientData.sections ? { sections: this.clientData.sections } : defaultTemplate;

    const sections = await Promise.all(
      template.sections.map(async (section) => {
        const newSection = { ...section };
        newSection.content = await this.populateSectionContent(section, processedData);
        return newSection;
      })
    );

    return {
      sections,
      summary: 'This is a summary of the report.',
    };
  }

  async populateSectionContent(section, processedData) {
    const { survey, responses } = this.clientData;
    const allQuestions = survey.questions || [];
    const allResponses = responses || [];

    switch (section.title) {
      case 'Study Overview':
        return [{
          title: 'Project name, background, objectives, methodology',
          content: `This report details the findings of the ${survey.title} survey.`,
        }];
      case 'Respondent Profile':
        return this.generateRespondentProfile(allResponses);
      case 'Executive Summary':
        return [{
          title: 'Key highlights and topline insights',
          content: 'This section provides a high-level summary of the key findings.',
        }];
      case 'Core Insight Areas':
        return this.generateCoreInsightAreas(allQuestions, allResponses);
      default:
        return section.content.map(subSection => ({ ...subSection, content: 'No data available.' }));
    }
  }

  generateRespondentProfile(responses) {
    const profile = {
      location: {},
      gender: {},
      age: {},
    };

    responses.forEach(res => {
      if (res.location && res.location.city) {
        profile.location[res.location.city] = (profile.location[res.location.city] || 0) + 1;
      }
      if (res.demographics && res.demographics.gender) {
        profile.gender[res.demographics.gender] = (profile.gender[res.demographics.gender] || 0) + 1;
      }
      if (res.demographics && res.demographics.age) {
        profile.age[res.demographics.age] = (profile.age[res.demographics.age] || 0) + 1;
      }
    });

    return [
      { title: 'Location', content: JSON.stringify(profile.location) },
      { title: 'Gender', content: JSON.stringify(profile.gender) },
      { title: 'Age', content: JSON.stringify(profile.age) },
    ];
  }

  async generateCoreInsightAreas(questions, responses) {
    const insightAreas = [];
    for (const question of questions) {
      const chartData = this.prepareChartDataForQuestion(question, responses);
      const chart = chartData ? await this.chartGenerator.generateChart(chartData) : null;
      insightAreas.push({
        title: question.text,
        content: `Analysis of question: ${question.text}`,
        chart,
      });
    }
    return insightAreas;
  }

  prepareChartDataForQuestion(question, responses) {
    if (!question || !responses || responses.length === 0) return null;

    let labels, data;
    const chartType = this.getChartType(question.type);

    if (question.type === 'single-choice' || question.type === 'multiple-choice') {
      labels = question.options;
      data = labels.map(option =>
        responses.filter(res => {
          const answer = res.responseData[question.id];
          return answer && (Array.isArray(answer) ? answer.includes(option) : answer === option);
        }).length
      );
    } else if (question.type === 'rating') {
      labels = Array.from({ length: question.maxRating || 5 }, (_, i) => i + 1);
      data = labels.map(rating =>
        responses.filter(res => res.responseData[question.id] === rating).length
      );
    } else {
      return null; // Don't generate charts for other types for now
    }

    return {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: question.text,
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      },
      options: { scales: { y: { beginAtZero: true } } },
    };
  }

  getChartType(questionType) {
    switch (questionType) {
      case 'single-choice':
      case 'multiple-choice':
        return 'pie';
      case 'rating':
        return 'bar';
      default:
        return 'bar';
    }
  }
}
