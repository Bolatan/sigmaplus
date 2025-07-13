// Generates the Core Insights section of the report

export default class CoreInsights {
  constructor(data) {
    this.data = data;
  }

  generate() {
    // Generate the content for the Core Insights section
    return {
      title: "Core Insight Areas",
      content: this.data.coreInsights,
    };
  }
}
