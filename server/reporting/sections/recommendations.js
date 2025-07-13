// Generates the Recommendations section of the report

export default class Recommendations {
  constructor(data) {
    this.data = data;
  }

  generate() {
    // Generate the content for the Recommendations section
    return {
      title: "Recommendations",
      content: this.data.recommendations,
    };
  }
}
