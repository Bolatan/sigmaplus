import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import pptxgen from 'pptxgenjs';
import Excel from 'exceljs';
import fs from 'fs';
import Reporting from '../reporting/index.js';
import Presentation from '../reporting/presentation.js';
import { sanitizeFilename } from '../utils/sanitize.js';

// Helper function to wrap text for PDF
function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// @desc    Generate a new report
// @route   POST /api/reports
// @access  Private (Admin, Agent)
export const generateReport = async (req, res) => {
  try {
    const db = getDb();
    const { surveyId, title, clientId, template } = req.body;
    const reportsCollection = db.collection('reports');

    if (!ObjectId.isValid(surveyId) || (clientId && !ObjectId.isValid(clientId))) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    const responses = await db.collection('responses').find({ surveyId: new ObjectId(surveyId) }).toArray();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    const company = await db.collection('companies').findOne({ _id: new ObjectId(req.user.companyId) });
    const client = clientId ? await db.collection('users').findOne({ _id: new ObjectId(clientId) }) : null;
    const project = survey.projectId ? await db.collection('projects').findOne({ _id: new ObjectId(survey.projectId) }) : null;

    const reporting = new Reporting({
      survey,
      responses,
      user,
      company,
      client,
      title,
      template,
      project,
    });

    const reportData = await reporting.generateReport();

    console.log('--- SURVEY ID ---');
    console.log(surveyId);
    console.log('--- END SURVEY ID ---');

    const newReport = {
      title,
      surveyId: new ObjectId(surveyId),
      companyId: req.user.companyId,
      generatedBy: new ObjectId(req.user.id),
      clientId: client ? new ObjectId(clientId) : null,
      createdAt: new Date(),
      status: 'completed',
      ...reportData,
    };

    const result = await reportsCollection.insertOne(newReport);
    res.status(201).json({ data: { ...newReport, _id: result.insertedId } });
  } catch (err) {
    console.error('Failed to generate report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Admins, Agents, Clients)
export const getReports = async (req, res) => {
  try {
    const db = getDb();
    const reportsCollection = db.collection('reports');
    let query = {};

    // Role-based filtering
    if (req.user.role === 'client' && req.user.companyId) {
      query.companyId = new ObjectId(req.user.companyId);
    }
    // Agents might have specific access rules, e.g., by surveys they manage
    // For now, they can see all reports, but this can be refined.

    const reports = await reportsCollection.find(query).toArray();
    res.json({ data: reports });
  } catch (err) {
    console.error('Failed to fetch reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports from database' });
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const report = await db.collection('reports').findOne({ _id: new ObjectId(id) });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Access control
    if (req.user.role === 'client' && (!report.companyId || report.companyId.toString() !== req.user.companyId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ data: report });
  } catch (err) {
    console.error(`Failed to fetch report ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

// @desc    Download a report by ID
// @route   GET /api/reports/:id/download
// @access  Private
export const downloadReport = async (req, res) => {
  try {
    console.log('Download report request received');
    const db = getDb();
    const { id } = req.params;
    const { format } = req.query; // pptx, xlsx, pdf

    if (!ObjectId.isValid(id)) {
      console.error('Invalid report ID format');
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const report = await db.collection('reports').findOne({ _id: new ObjectId(id) });

    if (!report) {
      console.error('Report not found');
      return res.status(404).json({ error: 'Report not found' });
    }

    console.log('Report found:', report.title);

    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(report.surveyId) });
    const responses = await db.collection('responses').find({ surveyId: new ObjectId(report.surveyId) }).toArray();
    const user = await db.collection('users').findOne({ _id: new ObjectId(report.generatedBy) });
    const company = await db.collection('companies').findOne({ _id: new ObjectId(report.companyId) });
    const client = report.clientId ? await db.collection('users').findOne({ _id: new ObjectId(report.clientId) }) : null;
    const project = survey.projectId ? await db.collection('projects').findOne({ _id: new ObjectId(survey.projectId) }) : null;

    // const logo = fs.readFileSync('logo.png').toString('base64');
    const chart = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // Placeholder chart

    console.log('--- REPORT DATA ---');
    console.log(JSON.stringify(report, null, 2));
    console.log('--- END REPORT DATA ---');

    switch (format) {
      case 'pptx': {
        try {
          console.log('Generating PPTX report');
          const presentation = new Presentation({ sections: report.sections || [] });
          const pptx = presentation.generate();
          
          // Get buffer from pptx - different methods depending on pptxgenjs version
          let buffer;
          if (typeof pptx.write === 'function') {
            buffer = await pptx.write();
          } else if (typeof pptx.writeFile === 'function') {
            buffer = await pptx.writeFile({ outputType: 'buffer' });
          } else if (typeof pptx.stream === 'function') {
            buffer = await pptx.stream();
          } else {
            // Fallback: try to get buffer directly
            buffer = pptx;
          }
          
          // Ensure buffer is a Buffer instance
          if (!Buffer.isBuffer(buffer)) {
            buffer = Buffer.from(buffer);
          }
          
          const sanitizedTitle = sanitizeFilename(report.title);
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pptx"`);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
          res.setHeader('Content-Length', buffer.length);
          res.end(buffer);
          console.log('PPTX report sent');
        } catch (e) {
          console.error('Error generating pptx file:', e.message);
          console.error('Stack trace:', e.stack);
          res.status(500).json({ error: 'Failed to generate pptx report', details: e.message });
        }
        break;
      }
      case 'xlsx': {
        try {
          console.log('Generating XLSX report');
          const workbook = new Excel.Workbook();
          const worksheet = workbook.addWorksheet('Report');

          // Add more comprehensive report data
          worksheet.columns = [
            { header: 'Field', key: 'field', width: 30 },
            { header: 'Value', key: 'value', width: 50 },
          ];

          // Add report metadata
          worksheet.addRow({ field: 'Report ID', value: report._id.toString() });
          worksheet.addRow({ field: 'Title', value: report.title });
          worksheet.addRow({ field: 'Description', value: report.description || 'No description' });
          worksheet.addRow({ field: 'Survey Title', value: survey?.title || 'N/A' });
          worksheet.addRow({ field: 'Company', value: company?.name || 'N/A' });
          worksheet.addRow({ field: 'Generated By', value: user?.name || user?.email || 'N/A' });
          worksheet.addRow({ field: 'Generated Date', value: new Date(report.createdAt).toLocaleDateString() });
          worksheet.addRow({ field: '', value: '' }); // Empty row

          // Add sections data
          if (report.sections && Array.isArray(report.sections)) {
            worksheet.addRow({ field: 'SECTIONS', value: '' });
            report.sections.forEach((section, index) => {
              worksheet.addRow({ field: `Section ${index + 1}`, value: section.title || 'No title' });
              worksheet.addRow({ field: `Content ${index + 1}`, value: section.content || 'No content' });
              worksheet.addRow({ field: '', value: '' }); // Empty row
            });
          }

          const buffer = await workbook.xlsx.writeBuffer();
          
          // Ensure buffer is a Buffer instance
          const finalBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
          
          const sanitizedTitle = sanitizeFilename(report.title);
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.xlsx"`);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Length', finalBuffer.length);
          res.end(finalBuffer);
          console.log('XLSX report sent');
        } catch (e) {
          console.error('Error generating xlsx file:', e.message);
          console.error('Stack trace:', e.stack);
          res.status(500).json({ error: 'Failed to generate xlsx report', details: e.message });
        }
        break;
      }
      case 'pdf': {
        try {
          console.log('Generating PDF report');
          const pdfDoc = await PDFDocument.create();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          
          // Add first page
          let currentPage = pdfDoc.addPage();
          let y = 800; // Start position

          // Add logo if available
          try {
            const logoImageBytes = fs.readFileSync('./logo.png');
            const logoImage = await pdfDoc.embedPng(logoImageBytes);
            const logoDims = logoImage.scale(0.25);

            currentPage.drawImage(logoImage, {
              x: 50,
              y: 780,
              width: logoDims.width,
              height: logoDims.height,
            });
          } catch (logoError) {
            console.error('Logo not found, continuing without logo:', logoError.message);
          }

          // Add title and other info
          y = 750;
          currentPage.drawText(survey?.title || 'No Title', { x: 50, y, size: 25, font: boldFont });
          y -= 30;
          currentPage.drawText(`Project: ${project?.name || 'N/A'}`, { x: 50, y, size: 15, font });
          y -= 20;
          currentPage.drawText(`Company: ${company?.name || 'N/A'}`, { x: 50, y, size: 15, font });
          y -= 50;

          if (report.sections && Array.isArray(report.sections)) {
            console.log('--- SECTIONS ---');
            console.log(JSON.stringify(report.sections, null, 2));
            console.log('--- END SECTIONS ---');
            
            for (let sectionIndex = 0; sectionIndex < report.sections.length; sectionIndex++) {
              const section = report.sections[sectionIndex];
              
              // Check if we need a new page
              if (y < 100) {
                currentPage = pdfDoc.addPage();
                y = 800;
              }

              // Add section title
              currentPage.drawText(`${String.fromCharCode(97 + sectionIndex)}. ${section.title || 'No Section Title'}`, { 
                x: 50, 
                y, 
                size: 20,
                font: boldFont
              });
              y -= 30;

              if (Array.isArray(section.content)) {
                for (let i = 0; i < section.content.length; i++) {
                  const subSection = section.content[i];
                  
                  if (y < 100) {
                    currentPage = pdfDoc.addPage();
                    y = 800;
                  }
                  
                  // Add subsection title
                  currentPage.drawText(`  • ${subSection.title || 'No Sub-Section Title'}`, { 
                    x: 70, 
                    y, 
                    size: 15,
                    font: boldFont
                  });
                  y -= 20;

                  // Add subsection content
                  if (subSection.content) {
                    if (y < 100) {
                      currentPage = pdfDoc.addPage();
                      y = 800;
                    }
                    
                    // Wrap text to fit within page width
                    const wrappedLines = wrapText(String(subSection.content), 450, font, 12);
                    for (const line of wrappedLines) {
                      if (y < 50) {
                        currentPage = pdfDoc.addPage();
                        y = 800;
                      }
                      currentPage.drawText(line, { x: 90, y, size: 12, font });
                      y -= 15;
                    }
                    y -= 10; // Extra spacing after content
                  }
                  
                  // Add chart if available
                  if (subSection.chart) {
                    if (y < 250) {
                      currentPage = pdfDoc.addPage();
                      y = 800;
                    }
                    try {
                      const chartImage = await pdfDoc.embedPng(Buffer.from(subSection.chart, 'base64'));
                      const chartDims = chartImage.scale(0.5);
                      currentPage.drawImage(chartImage, {
                        x: 90,
                        y: y - chartDims.height,
                        width: chartDims.width,
                        height: chartDims.height,
                      });
                      y -= chartDims.height + 20;
                    } catch (chartError) {
                      console.error('Error embedding chart:', chartError.message);
                      // Continue without the chart
                    }
                  }
                }
              }
              
              y -= 25; // Extra spacing between sections
            }
          }

          const pdfBytes = await pdfDoc.save();
          const sanitizedTitle = sanitizeFilename(report.title);
          
          // Set proper headers
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
          res.setHeader('Content-Length', pdfBytes.length);
          
          // Send as proper buffer
          res.end(Buffer.from(pdfBytes));
          console.log('PDF report sent successfully');
          
        } catch (err) {
          console.error('Error creating/saving pdf document:', err.message);
          console.error('Stack trace:', err.stack);
          res.status(500).json({ error: 'Failed to create pdf document', details: err.message });
        }
        break;
      }
      default:
        console.error('Invalid format specified');
        return res.status(400).json({ error: 'Invalid format specified' });
    }
  } catch (err) {
    console.error(`Failed to download report ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to download report' });
  }
};

// @desc    Update a report's metadata (e.g., title, sections)
// @route   PUT /api/reports/:id
// @access  Private (Admin, Agent)
export const updateReport = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { title, sections } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const updateDoc = {
      $set: {
        ...(title && { title }),
        ...(sections && { sections }),
        updatedAt: new Date(),
      },
    };

    const result = await db.collection('reports').updateOne({ _id: new ObjectId(id) }, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report updated successfully' });
  } catch (err) {
    console.error(`Failed to update report ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update report' });
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (Admin)
export const deleteReport = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const result = await db.collection('reports').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(204).send(); // No content
  } catch (err) {
    console.error(`Failed to delete report ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};

export const generateAllReports = async () => {
  console.log('Generating all reports...');
  // This is a placeholder for the actual report generation logic
};
