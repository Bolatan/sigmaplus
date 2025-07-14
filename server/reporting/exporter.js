import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import Excel from 'exceljs';
import libre from 'libreoffice-convert';
import util from 'util';
import { promisify } from 'util';

const convertAsync = promisify(libre.convert);

export default class Exporter {
  constructor(presentation, reportData) {
    this.presentation = presentation;
    this.reportData = reportData;
  }

  async toPdf() {
    try {
      const pptxBuffer = await this.presentation.write('buffer');
      const pdfBuffer = await convertAsync(pptxBuffer, '.pdf', undefined);
      await fs.writeFile(`${this.reportData.clientName}-report.pdf`, pdfBuffer);
      console.log('Exporting to PDF...');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  }

  async toExcel() {
    try {
      const workbook = new Excel.Workbook();
      this.reportData.sections.forEach(section => {
        const worksheet = workbook.addWorksheet(section.title);
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 30 },
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Content', key: 'content', width: 50 },
        ];
        worksheet.addRow({
          id: section.id,
          title: section.title,
          content: JSON.stringify(section.content),
        });
      });
      await workbook.xlsx.writeFile(`${this.reportData.clientName}-report.xlsx`);
      console.log('Exporting to Excel...');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  }
}
