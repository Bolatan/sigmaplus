import pptxgen from 'pptxgenjs';

export default class Presentation {
  constructor({ survey, responses, client, report, logo, chart }) {
    this.survey = survey;
    this.responses = responses;
    this.client = client;
    this.report = report;
    this.logo = logo;
    this.chart = chart;
    this.pptx = new pptxgen();
  }

  generate() {
    if (this.client && this.client.branding) {
      if (this.client.branding.primaryColor) {
        this.pptx.defineLayout({
          name: 'MASTER_SLIDE',
          width: 10,
          height: 5.625,
          background: { color: this.client.branding.primaryColor },
        });
        this.pptx.layout = 'MASTER_SLIDE';
      }
      if (this.client.branding.logoUrl) {
        this.pptx.addSlide().addImage({ path: this.client.branding.logoUrl, x: 1, y: 1, w: 1, h: 1 });
      }
    }

    // --- Landing Page ---
    this.createLandingPageSlide();

    // --- Study Overview ---
    this.createStudyOverviewSlide();

    // --- Respondent Profile ---
    this.createRespondentProfileSlide();

    // --- Executive Summary ---
    this.createExecutiveSummarySlide();

    // --- Core Insight Areas ---
    this.createCoreInsightAreasSlides();

    // --- Regional and Outlet-Level Findings ---
    this.createRegionalAndOutletLevelFindingsSlide();

    // --- Recommendations ---
    this.createRecommendationsSlide();

    // --- Historical Trend Comparisons ---
    this.createHistoricalTrendComparisonsSlide();

    // --- Add Footers ---
    this.addFooters();

    return this.pptx;
  }

  createLandingPageSlide() {
    const slide = this.pptx.addSlide();
    slide.addImage({ data: `data:image/png;base64,${this.logo}`, x: '45%', y: '40%', w: '10%', h: '20%' });
    slide.addText(this.survey.title, { x: 0, y: '55%', w: '100%', align: 'center', fontSize: 24, bold: true });
  }

  createStudyOverviewSlide() {
    const slide = this.pptx.addSlide();
    slide.addText('Study Overview', { x: 1, y: 1, fontSize: 24, bold: true });
    // Add more details from this.survey if needed
  }

  createRespondentProfileSlide() {
    const slide = this.pptx.addSlide();
    slide.addText('Respondent Profile', { x: 1, y: 1, fontSize: 24, bold: true });

    const demographics = this.responses.map(r => r.demographics).filter(d => d);
    const locations = this.responses.map(r => r.location).filter(l => l);

    const ageGroups = demographics.reduce((acc, d) => {
      const age = d.age || 'N/A';
      acc[age] = (acc[age] || 0) + 1;
      return acc;
    }, {});

    const genderGroups = demographics.reduce((acc, d) => {
      const gender = d.gender || 'N/A';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    slide.addText('Age Distribution:', { x: 1, y: 2 });
    Object.entries(ageGroups).forEach(([age, count], index) => {
      slide.addText(`${age}: ${count}`, { x: 1.5, y: 2.5 + (index * 0.5) });
    });

    slide.addText('Gender Distribution:', { x: 1, y: 4 });
    Object.entries(genderGroups).forEach(([gender, count], index) => {
      slide.addText(`${gender}: ${count}`, { x: 1.5, y: 4.5 + (index * 0.5) });
    });
  }

  createExecutiveSummarySlide() {
    const slide = this.pptx.addSlide();
    slide.addText('Executive Summary', { x: 1, y: 1, fontSize: 24, bold: true });
    slide.addText(this.report.summary || 'No summary available.', { x: 1, y: 2 });
  }

  createCoreInsightAreasSlides() {
    // These would be individual slides
    const brandAwarenessSlide = this.pptx.addSlide();
    brandAwarenessSlide.addText('Brand Awareness', { x: 1, y: 1, fontSize: 24, bold: true });

    const brandUsageSlide = this.pptx.addSlide();
    brandUsageSlide.addText('Brand Usage', { x: 1, y: 1, fontSize: 24, bold: true });

    const customerSatisfactionSlide = this.pptx.addSlide();
    customerSatisfactionSlide.addText('Customer Satisfaction', { x: 1, y: 1, fontSize: 24, bold: true });

    const chartSlide = this.pptx.addSlide();
    chartSlide.addText('Chart', { x: 1, y: 1, fontSize: 24, bold: true });
    chartSlide.addImage({ data: `data:image/png;base64,${this.chart}`, x: 1, y: 2, w: 8, h: 4 });
  }

  createRegionalAndOutletLevelFindingsSlide() {
    const slide = this.pptx.addSlide();
    slide.addText('Regional and Outlet-Level Findings', { x: 1, y: 1, fontSize: 24, bold: true });
    slide.addText('Comparisons and heatmaps by state or zone will be added in a future update.', { x: 1, y: 2 });
  }

  createRecommendationsSlide() {
    const slide = this.pptx.addSlide();
    slide.addText('Recommendations', { x: 1, y: 1, fontSize: 24, bold: true });
    slide.addText('Strategic actions based on key insights will be added in a future update.', { x: 1, y: 2 });
  }

  createHistoricalTrendComparisonsSlide() {
    const slide = this.pptx.addSlide();
    slide.addText('Historical Trend Comparisons', { x: 1, y: 1, fontSize: 24, bold: true });
    slide.addText('Historical trend comparisons will be added in a future update.', { x: 1, y: 2 });
  }

  addFooters() {
    const firstRespondent = this.responses[0] || {};
    const respondentName = firstRespondent.respondentName || 'N/A';
    const respondentLocation = firstRespondent.location ? `${firstRespondent.location.city}, ${firstRespondent.location.country}` : 'N/A';
    const respondentResponse = firstRespondent.response ? JSON.stringify(firstRespondent.response).substring(0, 50) + '...' : 'N/A';

    this.pptx.slides.forEach((slide, index) => {
      slide.addText(
        `Respondent: ${respondentName} | Location: ${respondentLocation} | Response: ${respondentResponse}`,
        { x: 0.5, y: 5.2, fontSize: 8, color: '666666' }
      );
      slide.addText(
          `Slide ${index + 1}`,
          { x: 9, y: 5.2, fontSize: 8, color: '666666' }
      );
    });
  }
}
