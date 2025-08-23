import { generateChart } from '../chartGenerator.js';

export default class RespondentProfile {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
  }

  async generate() {
    console.log('Generating respondent profile section...');
    const profileData = this.dataProcessor.getDemographicsProfile();

    const content = [];

    for (const [key, data] of Object.entries(profileData)) {
      if (Object.keys(data).length > 0) {
        // Capitalize the key for the title
        const title = key.charAt(0).toUpperCase() + key.slice(1);

        // Format the text content
        const textContent = Object.entries(data)
          .map(([value, count]) => `${value}: ${count} respondents`)
          .join('\n');

        // Prepare data for the chart
        const chartData = {
          labels: Object.keys(data),
          datasets: [{
            label: `Distribution by ${title}`,
            data: Object.values(data),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
          }],
        };

        // Generate the chart image
        const chartImage = await generateChart(chartData);

        content.push({
          title: `Distribution by ${title}`,
          content: textContent,
          chart: chartImage, // Add the base64 chart image
        });
      }
    }

    return {
      title: 'Respondent Profile',
      content: content.length > 0 ? content : [{ title: 'No respondent profile data available.', content: '' }],
    };
  }
}
