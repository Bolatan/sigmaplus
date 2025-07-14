export const createStudyOverviewSlide = (pptx, survey) => {
  const slide = pptx.addSlide();
  slide.addText('Study Overview', { x: 1, y: 1, fontSize: 24, bold: true });
  slide.addText(`Project Name: ${survey.title}`, { x: 1, y: 2 });
  slide.addText(`Background: ${survey.description}`, { x: 1, y: 2.5 });
  slide.addText(`Objectives: ${survey.objectives || 'N/A'}`, { x: 1, y: 3 });
  slide.addText(`Methodology: ${survey.methodology || 'N/A'}`, { x: 1, y: 3.5 });
};

export const createLandingPageSlide = (pptx, survey, logo) => {
  const slide = pptx.addSlide();
  // Add Signaplus logo
  slide.addImage({ data: `data:image/png;base64,${logo}`, x: 1, y: 1, w: 2, h: 1 });
  slide.addText(survey.title, { x: 1, y: 3, fontSize: 32, bold: true, align: 'center' });
};
