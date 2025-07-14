import pptxgen from 'pptxgenjs';

export default class Presentation {
  constructor({ sections }) {
    this.sections = sections;
    this.pptx = new pptxgen();
  }

  generate() {
    this.sections.forEach(section => {
      const slide = this.pptx.addSlide();
      slide.addText(section.title, { x: 0.5, y: 0.25, fontSize: 18, bold: true });
      slide.addText(section.content, { x: 0.5, y: 1.0, fontSize: 12 });
    });
    return this.pptx;
  }
}
