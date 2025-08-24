import pptxgen from 'pptxgenjs';

// Reusable slide layouts
const layouts = {
  title: {
    x: '5%',
    y: '40%',
    w: '90%',
    h: '20%',
    align: 'center',
    fontSize: 36,
    bold: true,
    color: '363636',
  },
  subtitle: {
    x: '5%',
    y: '60%',
    w: '90%',
    h: '10%',
    align: 'center',
    fontSize: 18,
    color: '7F7F7F',
  },
  sectionHeader: {
    x: 0.5,
    y: '45%',
    w: '90%',
    h: '10%',
    align: 'center',
    fontSize: 28,
    bold: true,
  },
  contentTitle: {
    x: 0.5,
    y: 0.25,
    w: '90%',
    h: '10%',
    fontSize: 24,
    bold: true,
  },
  contentBody: {
    x: 0.5,
    y: 1.5,
    w: '90%',
    h: '75%',
    fontSize: 14,
    bullet: true,
  },
};

export default class Presentation {
  constructor({ report, company, survey, project }) {
    this.report = report;
    this.company = company;
    this.survey = survey;
    this.project = project;
    this.pptx = new pptxgen();
    this.defineMasters();
  }

  defineMasters() {
    this.pptx.defineSlideMaster({
      title: 'TITLE_SLIDE',
      background: { color: 'FFFFFF' },
      objects: [
        { text: { text: this.company?.name || 'Signa Plus', options: { ...layouts.subtitle, y: '90%', color: 'C0C0C0' } } },
      ],
    });

    this.pptx.defineSlideMaster({
      title: 'SECTION_HEADER_SLIDE',
      background: { color: 'F1F1F1' },
      objects: [
        { text: { text: this.company?.name || 'Signa Plus', options: { ...layouts.subtitle, y: '90%', color: 'C0C0C0' } } },
      ],
    });

    this.pptx.defineSlideMaster({
      title: 'CONTENT_SLIDE',
      background: { color: 'FFFFFF' },
      objects: [
        { text: { text: this.company?.name || 'Signa Plus', options: { ...layouts.subtitle, y: '90%', color: 'C0C0C0' } } },
      ],
    });
  }

  addBrandUsageSlide(section) {
    if (!section.content || !Array.isArray(section.content)) {
      return;
    }

    section.content.forEach(subSection => {
      const slide = this.pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
      slide.addText(subSection.title, layouts.contentTitle);

      const content = subSection.content || 'No content available.';
      slide.addText(content, { ...layouts.contentBody, bullet: false });

      if (subSection.chartData) {
        slide.addText(`[Chart: ${subSection.chartData.type}]`, {
          x: 1,
          y: 4,
          w: '80%',
          h: '20%',
          align: 'center',
          color: 'C0C0C0'
        });
      }
    });
  }

  addTitleSlide() {
    const slide = this.pptx.addSlide({ masterName: 'TITLE_SLIDE' });
    slide.addText(this.report.title, layouts.title);
    slide.addText(this.survey?.title || '', layouts.subtitle);
  }

  addSectionHeaderSlide(title) {
    const slide = this.pptx.addSlide({ masterName: 'SECTION_HEADER_SLIDE' });
    slide.addText(title, layouts.sectionHeader);
  }

  addStudyOverviewSlide(section) {
    const slide = this.pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    slide.addText(section.title, layouts.contentTitle);

    const content = [
      `Project Name: ${this.project?.name || 'N/A'}`,
      `Background: ${this.project?.background || this.survey?.description || 'No background provided.'}`,
      `Objectives: ${this.project?.objectives || 'Not specified.'}`,
      `Methodology: ${this.survey?.methodology || 'Not specified.'}`,
    ];

    slide.addText(content.join('\\n'), layouts.contentBody);
  }

  addRespondentProfileSlide(section) {
    const slide = this.pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    slide.addText(section.title, layouts.contentTitle);

    // Process responses to get demographics
    const responses = this.report.responses || [];
    const total = responses.length;

    const gender = responses.reduce((acc, res) => {
      const g = res.data.demographics_gender || 'Unknown';
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});

    const age = responses.reduce((acc, res) => {
      const a = res.data.demographics_age;
      if (a) {
        if (a < 25) acc['Under 25'] = (acc['Under 25'] || 0) + 1;
        else if (a <= 35) acc['25-35'] = (acc['25-35'] || 0) + 1;
        else if (a <= 50) acc['36-50'] = (acc['36-50'] || 0) + 1;
        else acc['Over 50'] = (acc['Over 50'] || 0) + 1;
      } else {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {});

    const genderText = Object.entries(gender).map(([k, v]) => `${k}: ${v} (${((v/total)*100).toFixed(1)}%)`).join(', ');
    const ageText = Object.entries(age).map(([k, v]) => `${k}: ${v} (${((v/total)*100).toFixed(1)}%)`).join(', ');

    const content = [
      `Total Respondents: ${total}`,
      `Gender Distribution: ${genderText || 'N/A'}`,
      `Age Distribution: ${ageText || 'N/A'}`,
      // Placeholders for other fields
      'Occupation: Data not available',
      'Income: Data not available',
      'Outlet Type: Data not available',
    ];

    slide.addText(content.join('\\n'), layouts.contentBody);

    // Placeholder for chart
    slide.addText('Chart will be generated here.', { x: 1, y: 4, w: '80%', h: '20%', align: 'center', color: 'C0C0C0' });
  }

  addBrandAwarenessSlide(section) {
    if (!section.content || !Array.isArray(section.content)) {
      return;
    }

    // Create a slide for each sub-section of Brand Awareness
    section.content.forEach(subSection => {
      const slide = this.pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
      slide.addText(subSection.title, layouts.contentTitle);

      const content = subSection.content || 'No content available.';
      slide.addText(content, { ...layouts.contentBody, bullet: false });

      // Add a placeholder for the chart if chartData exists
      if (subSection.chartData) {
        slide.addText(`[Chart: ${subSection.chartData.type}]`, {
          x: 1,
          y: 4,
          w: '80%',
          h: '20%',
          align: 'center',
          color: 'C0C0C0'
        });
      }
    });
  }

  addGenericContentSlide(section) {
    const slide = this.pptx.addSlide({ masterName: 'CONTENT_SLIDE' });
    slide.addText(section.title || 'No Title', layouts.contentTitle);

    let contentText = 'No content available.';
    if (section.content) {
      if (Array.isArray(section.content)) {
        contentText = section.content.map(item => item.title ? `• ${item.title}: ${item.content || ''}`: `• ${item}`).join('\\n');
      } else {
        contentText = String(section.content);
      }
    }
    slide.addText(contentText, { ...layouts.contentBody, bullet: false });
  }

  async generate() {
    this.addTitleSlide();

    if (this.report.sections && Array.isArray(this.report.sections)) {
      this.report.sections.forEach(section => {
        this.addSectionHeaderSlide(section.title);

        switch (section.title) {
          case 'Study Overview':
            this.addStudyOverviewSlide(section);
            break;
          case 'Respondent Profile':
            this.addRespondentProfileSlide(section);
            break;
          case 'Brand Awareness & Perception':
            this.addBrandAwarenessSlide(section);
            break;
          case 'Brand Usage & Purchase Behavior':
            this.addBrandUsageSlide(section);
            break;
          default:
            // Generic handling for other sections
            if (section.content && Array.isArray(section.content)) {
              section.content.forEach(subSection => {
                this.addGenericContentSlide(subSection);
              });
            } else {
              this.addGenericContentSlide(section);
            }
            break;
        }
      });
    }

    // Return the generated buffer
    const blob = await this.pptx.write();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  }
}
