import DataProcessor from './dataProcessor.js';
import { defaultTemplate } from './templates.js';
import { ChartGenerator } from './chartGenerator.js';
export default class Reporting {
  constructor(clientData) {
    this.clientData = clientData;
    this.chartGenerator = new ChartGenerator();
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
        const newSection = { ...section };
        newSection.content = await Promise.all(
          section.content.map(async (subSection) => {
            const newSubSection = { ...subSection };
            // TODO: Add logic to populate the content of each subsection
            // For now, we will just add a placeholder chart
            if (this.clientData.responses && this.clientData.responses.length > 0) {
                const chartData = this.prepareChartData(this.clientData.responses);
                if(chartData) {
                    newSubSection.chart = await this.chartGenerator.generateChart(chartData);
                }
            }
            return newSubSection;
          })
        );
        return newSection;
      })
    );

    return {
      sections,
      summary: 'This is a summary of the report.',
    };
  }

  prepareChartData(responses) {
    const question = this.clientData.survey.questions[0];
    if (!question) return null;

    const labels = question.options;
    const data = labels.map(option => {
        return responses.filter(response => {
            const answer = response.responseData[question.id];
            return answer && answer.includes(option);
        }).length;
    });

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: question.text,
                data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
  }
}
