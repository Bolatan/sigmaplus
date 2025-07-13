// Generates the Study Overview section of the report

export default class StudyOverview {
  constructor(data) {
    this.data = data;
  }

  generate() {
    const slideContent = [
      {
        text: this.data.projectName,
        options: { x: 1, y: 1, w: "80%", h: 1, fontSize: 36, bold: true, align: "center" },
      },
      {
        text: "Study Overview",
        options: { x: 1, y: 2, w: "80%", h: 1, fontSize: 24, align: "center" },
      },
      {
        text: `Background: ${this.data.background}`,
        options: { x: 1, y: 3.5, w: "80%", h: 1, fontSize: 18 },
      },
      {
        text: `Objectives: ${this.data.objectives}`,
        options: { x: 1, y: 4.5, w: "80%", h: 1, fontSize: 18 },
      },
      {
        text: `Methodology: ${this.data.methodology}`,
        options: { x: 1, y: 5.5, w: "80%", h: 1, fontSize: 18 },
      },
    ];

    return {
      title: "Study Overview",
      slideContent,
    };
  }
}
