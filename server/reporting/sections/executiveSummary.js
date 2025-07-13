// Generates the Executive Summary section of the report

export default class ExecutiveSummary {
  constructor(data) {
    this.data = data;
  }

  generate() {
    // Generate the content for the Executive Summary section
    return {
      title: "Executive Summary",
      content: this.data.executiveSummary,
    };
  }
}
