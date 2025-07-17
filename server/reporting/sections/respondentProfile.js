export default class RespondentProfile {
  constructor(processedData) {
    this.processedData = processedData;
  }

  generate() {
    console.log('Generating respondent profile section...');
    return {
      title: 'Respondent Profile',
      content: '',
    };
  }
}
