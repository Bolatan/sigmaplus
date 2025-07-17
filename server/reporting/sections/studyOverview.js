export default class StudyOverview {
  constructor(processedData) {
    this.processedData = processedData;
  }

  generate() {
    console.log('Generating study overview section...');
    return {
      title: 'Study Overview',
      content: '',
    };
  }
}
