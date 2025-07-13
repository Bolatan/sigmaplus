// Generates the Recommendations section of the report

export default class Recommendations {
  constructor(data) {
    this.data = data;
  }

  generate() {
    const slideContent = [
      {
        text: "Recommendations",
        options: { x: 1, y: 1, w: "80%", h: 1, fontSize: 36, bold: true, align: "center" },
      },
      {
        text: this.data.recommendations,
        options: { x: 1, y: 2.5, w: "80%", h: 4, fontSize: 18, align: "left" },
      },
    ];

    return {
      title: "Recommendations",
      slideContent,
    };
  }
}
