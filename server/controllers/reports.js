import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import pptxgen from 'pptxgenjs';
import Excel from 'exceljs';
import fs from 'fs';
import Reporting from '../reporting/index.js';
import Presentation from '../reporting/presentation.js';
import { sanitizeFilename } from '../utils/sanitize.js';


// @desc    Generate a new report
// @route   POST /api/reports
// @access  Private (Admin, Agent)
export const generateReport = async (req, res) => {
  try {
    const db = getDb();
    const { surveyId, title, clientId } = req.body;
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

    const reporting = new Reporting({
      survey,
      responses,
      user,
      company,
      client,
      title
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

    const reporting = new Reporting({
      survey,
      responses,
      user,
      company,
      client,
      title: report.title
    });

    const reportData = await reporting.generateReport();
    report.sections = reportData.sections;

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
          const buffer = await pptx.write();
          const sanitizedTitle = sanitizeFilename(report.title);
          res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}.pptx`);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
          res.send(buffer);
          console.log('PPTX report sent');
        } catch (e) {
          console.error('Error generating pptx file:', e);
          res.status(500).json({ error: 'Failed to generate pptx report' });
        }
        break;
      }
      case 'xlsx': {
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 30 },
          { header: 'Title', key: 'title', width: 30 },
          { header: 'Description', key: 'description', width: 50 },
        ];

        worksheet.addRow({id: report._id, title: report.title, description: report.description});

        const buffer = await workbook.xlsx.writeBuffer();
        const sanitizedTitle = sanitizeFilename(report.title);
        res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        break;
      }
      case 'pdf': {
        console.log('Generating PDF report');
        PDFDocument.create().then(pdfDoc => {
          const page = pdfDoc.addPage();
          page.drawText(survey.title || 'No Title', { x: 50, y: 800, size: 25 });

          if (report.sections && Array.isArray(report.sections)) {
            console.log('--- SECTIONS ---');
            console.log(JSON.stringify(report.sections, null, 2));
            console.log('--- END SECTIONS ---');
            report.sections.forEach((section, index) => {
              const currentPage = index === 0 ? page : pdfDoc.addPage();
              currentPage.drawText(section.title || 'No Section Title', { x: 50, y: 800, size: 20 });
              if (section.content) {
                currentPage.drawText(String(section.content), { x: 50, y: 750, size: 12 });
              }
            });
          }

          pdfDoc.save().then(pdfBytes => {
            const sanitizedTitle = sanitizeFilename(report.title);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${sanitizedTitle}.pdf`);
            res.send(Buffer.from(pdfBytes));
            console.log('PDF report sent');
          }).catch(err => {
            console.error('Error saving pdf file:', err);
            res.status(500).json({ error: 'Failed to save pdf report' });
          });
        }).catch(err => {
          console.error('Error creating pdf document:', err);
          res.status(500).json({ error: 'Failed to create pdf document' });
        });
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

