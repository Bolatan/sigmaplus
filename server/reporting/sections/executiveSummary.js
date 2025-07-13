// Generates the Executive Summary section of the report

export default class ExecutiveSummary {
  constructor(data) {
    this.data = data;
  }

  generate() {
    const slideContent = [
      {
        text: "Executive Summary",
        options: { x: 1, y: 1, w: "80%", h: 1, fontSize: 36, bold: true, align: "center" },
      },
      {
        text: this.data.executiveSummary,
        options: { x: 1, y: 2.5, w: "80%", h: 4, fontSize: 18, align: "left" },
      },
    ];

    return {
      title: "Executive Summary",
      slideContent,
    };
  }
}
