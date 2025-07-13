import pptxgen from "pptxgenjs";

export default class Presentation {
  constructor(reportData) {
    this.reportData = reportData;
  }

  generate() {
    let pptx = new pptxgen();

    this.reportData.sections.forEach(section => {
      let slide = pptx.addSlide();
      slide.addText(section.title, { x: 1, y: 1, w: "80%", h: 1, fontSize: 24 });

      if (Array.isArray(section.content)) {
        section.content.forEach((item, index) => {
          slide.addText(`${item.label}: ${item.value}`, { x: 1, y: 2 + index * 0.5, w: "80%", h: 0.5 });
        });
      } else {
        slide.addText(section.content, { x: 1, y: 2, w: "80%", h: "80%" });
      }
    });

    return pptx;
  }
}
