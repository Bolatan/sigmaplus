export default class StudyOverview {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    // The raw clientData is available via the dataProcessor instance
    this.clientData = dataProcessor.clientData;
  }

  generate() {
    console.log('Generating study overview section...');

    const survey = this.clientData.survey || {};
    const project = this.clientData.project || {}; // Assuming project data is passed in

    // Placeholder text if specific fields don't exist in the models
    const background = survey.description || 'No background provided.';
    const objectives = project.objectives || 'To gather insights on brand perception and market positioning.';
    const methodology = project.methodology || 'The study was conducted via a structured survey targeting key consumer demographics. Data was collected through both online and field interviews.';

    return {
      title: 'Study Overview',
      content: [
        {
          title: 'Project Name',
          content: project.name || survey.title || 'N/A',
        },
        {
          title: 'Background',
          content: background,
        },
        {
          title: 'Objectives',
          content: objectives,
        },
        {
          title: 'Methodology',
          content: methodology,
        },
      ],
    };
  }
}
