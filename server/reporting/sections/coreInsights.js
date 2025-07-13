// Generates the Core Insights section of the report

export default class CoreInsights {
  constructor(data) {
    this.data = data;
  }

  generate() {
    const slideContent = [
      {
        text: "Core Insight Areas",
        options: { x: 1, y: 1, w: "80%", h: 1, fontSize: 36, bold: true, align: "center" },
      },
    ];

    // This is a placeholder for more complex logic to handle different insight types
    if (typeof this.data.coreInsights === 'string') {
      slideContent.push({
        text: this.data.coreInsights,
        options: { x: 1, y: 2.5, w: "80%", h: 4, fontSize: 18, align: "left" },
      });
    }

    return {
      title: "Core Insight Areas",
      slideContent,
    };
  }
}
