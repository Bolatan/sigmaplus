// Generates the Respondent Profile section of the report

export default class RespondentProfile {
  constructor(data) {
    this.data = data;
  }

  generate() {
    const slideContent = [
      {
        text: "Respondent Profile",
        options: { x: 1, y: 1, w: "80%", h: 1, fontSize: 36, bold: true, align: "center" },
      },
    ];

    const chartData = this.data.respondentProfile.map(profile => ({
      name: profile.label,
      labels: [profile.value],
      values: [1], // Placeholder for actual values
    }));

    return {
      title: "Respondent Profile",
      slideContent,
      chartData,
    };
  }
}
