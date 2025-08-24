export default class RespondentProfile {
  constructor(processedData) {
    this.processedData = processedData;
  }

  generate() {
    console.log('Generating respondent profile section...');
    return {
      title: 'Respondent Profile',
      content: [
        {
          title: 'Location',
          content: '',
        },
        {
          title: 'Gender',
          content: '',
        },
        {
          title: 'Age',
          content: '',
        },
        {
          title: 'Occupation',
          content: '',
        },
        {
          title: 'Income',
          content: '',
        },
        {
          title: 'Outlet type',
          content: '',
        },
      ],
    };
  }
}
