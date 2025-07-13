// Generates the Respondent Profile section of the report

export default class RespondentProfile {
  constructor(data) {
    this.data = data;
  }

  generate() {
    // Generate the content for the Respondent Profile section
    return {
      title: "Respondent Profile",
      content: this.data.respondentProfile,
    };
  }
}
