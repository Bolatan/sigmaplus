export default class StudyOverview {
  constructor(processedData) {
    this.processedData = processedData;
  }

  generate() {
    console.log('Generating study overview section...');
    return {
      title: 'Study Overview',
      content: [
        {
          title: 'Project name',
          content: '',
        },
        {
          title: 'Background',
          content: '',
        },
        {
          title: 'Objectives',
          content: '',
        },
        {
          title: 'Methodology',
          content: '',
        },
      ],
    };
  }
}
