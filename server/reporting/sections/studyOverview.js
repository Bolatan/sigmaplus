export default class StudyOverview {
  constructor(processedData, generateChart) {
    this.processedData = processedData;
    this.generateChart = generateChart;
  }

  generate() {
    const { project } = this.processedData;
    return {
      title: 'Study Overview',
      content: [
        {
          title: 'Project name',
          content: project?.name || 'N/A',
        },
        {
          title: 'Background',
          content: project?.background || 'N/A',
        },
        {
          title: 'Objectives',
          content: project?.objectives || 'N/A',
        },
        {
          title: 'Methodology',
          content: project?.methodology || 'N/A',
        },
      ],
    };
  }
}
