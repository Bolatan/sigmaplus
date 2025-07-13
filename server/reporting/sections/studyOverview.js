// Generates the Study Overview section of the report

export default class StudyOverview {
  constructor(data) {
    this.data = data;
  }

  generate() {
    // Generate the content for the Study Overview section
    return {
      title: "Study Overview",
      content: [
        { label: "Project Name", value: this.data.projectName },
        { label: "Background", value: this.data.background },
        { label: "Objectives", value: this.data.objectives },
        { label: "Methodology", value: this.data.methodology },
      ],
    };
  }
}
