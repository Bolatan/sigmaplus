import PDFDocument from 'pdfkit';
import pptxgen from 'pptxgenjs';
import Excel from 'exceljs';
import fs from 'fs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

class Exporter {
  constructor(report) {
    this.report = report;
  }

  async toPPTX() {
    const pptx = new pptxgen();
    // Add content to the presentation based on the report data
    // For example:
    const slide = pptx.addSlide();
    slide.addText(this.report.title, { x: 1, y: 1, fontSize: 24, bold: true });

    this.createBrandAwarenessSlide(pptx, this.report.survey, this.report.responses);
    this.createBrandUsageSlide(pptx, this.report.survey, this.report.responses);
    this.createCustomerSatisfactionSlide(pptx, this.report.survey, this.report.responses);


    return await pptx.write();
  }

  async toXLSX() {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    // Add data to the worksheet based on the report data
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 32 },
      { header: 'D.O.B.', key: 'dob', width: 10, outlineLevel: 1 }
    ];
    worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970,1,1)});
    worksheet.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965,1,7)});
    return await workbook.xlsx.writeBuffer();
  }

  async toPDF() {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
        //
    });
    // Add content to the PDF based on the report data
    doc.fontSize(25).text(this.report.title, 100, 100);
    // Finalize the PDF and end the stream
    doc.end();
    return Buffer.concat(buffers);
  }

  createBrandAwarenessSlide(pptx, survey, responses) {
    const slide = pptx.addSlide();
    slide.addText('Brand Awareness & Perception', { x: 1, y: 1, fontSize: 24, bold: true });

    const awarenessKeywords = ['aware', 'familiar', 'heard of'];
    const perceptionKeywords = ['opinion', 'perception', 'impression', 'view'];

    const awarenessQuestions = survey.questions.filter(q =>
      awarenessKeywords.some(keyword => q.text.toLowerCase().includes(keyword))
    );

    const perceptionQuestions = survey.questions.filter(q =>
      perceptionKeywords.some(keyword => q.text.toLowerCase().includes(keyword))
    );

    let y = 2;

    if (awarenessQuestions.length > 0) {
      slide.addText('Brand Awareness', { x: 1, y: y, fontSize: 18, bold: true });
      y += 0.5;

      awarenessQuestions.forEach(q => {
        slide.addText(q.text, { x: 1, y: y, fontSize: 14 });
        y += 0.5;

        const questionResponses = responses.map(r => r.responseData[q.id]).filter(Boolean);
        const responseCounts = questionResponses.reduce((acc, response) => {
          acc[response] = (acc[response] || 0) + 1;
          return acc;
        }, {});

        Object.entries(responseCounts).forEach(([option, count]) => {
          slide.addText(`${option}: ${count}`, { x: 1.5, y: y });
          y += 0.5;
        });
      });
    }

    if (perceptionQuestions.length > 0) {
      slide.addText('Brand Perception', { x: 1, y: y, fontSize: 18, bold: true });
      y += 0.5;

      perceptionQuestions.forEach(q => {
        slide.addText(q.text, { x: 1, y: y, fontSize: 14 });
        y += 0.5;

        if (q.type === 'rating') {
          const ratings = responses.map(r => r.responseData[q.id]).filter(Boolean).map(Number);
          const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          slide.addText(`Average Rating: ${averageRating.toFixed(2)}`, { x: 1.5, y: y });
          y += 0.5;
        } else {
          const questionResponses = responses.map(r => r.responseData[q.id]).filter(Boolean);
          const responseCounts = questionResponses.reduce((acc, response) => {
            acc[response] = (acc[response] || 0) + 1;
            return acc;
          }, {});

          Object.entries(responseCounts).forEach(([option, count]) => {
            slide.addText(`${option}: ${count}`, { x: 1.5, y: y });
            y += 0.5;
          });
        }
      });
    }
  }

  createBrandUsageSlide(pptx, survey, responses) {
    const slide = pptx.addSlide();
    slide.addText('Brand Usage & Purchase Behavior', { x: 1, y: 1, fontSize: 24, bold: true });
    slide.addText('Data and visualizations for this section will be added in a future update.', { x: 1, y: 2 });
  }

  createCustomerSatisfactionSlide(pptx, survey, responses) {
    const slide = pptx.addSlide();
    slide.addText('Customer Satisfaction & Loyalty Metrics', { x: 1, y: 1, fontSize: 24, bold: true });
    slide.addText('Data and visualizations for this section will be added in a future update.', { x: 1, y: 2 });
  }

  async createChart(responses) {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });
    const configuration = {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    return image.toString('base64');
  }
}

export default Exporter;
