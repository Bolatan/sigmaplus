import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import PDFDocument from 'pdfkit';
import pptxgen from 'pptxgenjs';
import Excel from 'exceljs';
import fs from 'fs';
// Assuming Exporter is a separate utility file for report generation
import Exporter from '../utils/Exporter.js'; // Added import for Exporter
import Reporting from '../reporting/index.js'; // This is the module that was previously reported as not found for studyOverview.js

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
    const db = getDb();
    const { id } = req.params;
    const { format } = req.query; // pptx, xlsx, pdf

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const report = await db.collection('reports').findOne({ _id: new ObjectId(id) });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }


    const logo = fs.readFileSync('logo.png').toString('base64');
    const chart = await createChart(responses);

    if (format === 'pptx') {
      const pptx = new pptxgen();

      if (client && client.branding) {
        if (client.branding.primaryColor) {
          pptx.defineLayout({
            name: 'MASTER_SLIDE',
            width: 10,
            height: 5.625,
            background: { color: client.branding.primaryColor },
          });
          pptx.layout = 'MASTER_SLIDE';
        }
        if (client.branding.logoUrl) {
          pptx.addSlide().addImage({ path: client.branding.logoUrl, x: 1, y: 1, w: 1, h: 1 });
        }
      }

      // --- Landing Page ---
      createLandingPageSlide(pptx, survey, logo);

      // --- Study Overview ---
      createStudyOverviewSlide(pptx, survey);

      // --- Respondent Profile ---
      const profileSlide = pptx.addSlide();
      profileSlide.addText('Respondent Profile', { x: 1, y: 1, fontSize: 24, bold: true });

      const demographics = responses.map(r => r.demographics).filter(d => d);
      const locations = responses.map(r => r.location).filter(l => l);

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

      profileSlide.addText('Age Distribution:', { x: 1, y: 2 });
      Object.entries(ageGroups).forEach(([age, count], index) => {
        profileSlide.addText(`${age}: ${count}`, { x: 1.5, y: 2.5 + (index * 0.5) });
      });

      profileSlide.addText('Gender Distribution:', { x: 1, y: 4 });
      Object.entries(genderGroups).forEach(([gender, count], index) => {
        profileSlide.addText(`${gender}: ${count}`, { x: 1.5, y: 4.5 + (index * 0.5) });
      });

      // --- Executive Summary ---
      const summarySlide = pptx.addSlide();
      summarySlide.addText('Executive Summary', { x: 1, y: 1, fontSize: 24, bold: true });
      summarySlide.addText(report.summary || 'No summary available.', { x: 1, y: 2 });

      // --- Core Insight Areas ---
      createBrandAwarenessSlide(pptx, survey, responses);
      createBrandUsageSlide(pptx, survey, responses);
      createCustomerSatisfactionSlide(pptx, survey, responses);

      const chartSlide = pptx.addSlide();
      chartSlide.addText('Chart', { x: 1, y: 1, fontSize: 24, bold: true });
      chartSlide.addImage({ data: `data:image/png;base64,${chart}`, x: 1, y: 2, w: 8, h: 4 });

      // --- Regional and Outlet-Level Findings ---
      const regionalSlide = pptx.addSlide();
      regionalSlide.addText('Regional and Outlet-Level Findings', { x: 1, y: 1, fontSize: 24, bold: true });
      regionalSlide.addText('Comparisons and heatmaps by state or zone will be added in a future update.', { x: 1, y: 2 });

      // --- Recommendations ---
      const recommendationsSlide = pptx.addSlide();
      recommendationsSlide.addText('Recommendations', { x: 1, y: 1, fontSize: 24, bold: true });
      recommendationsSlide.addText('Strategic actions based on key insights will be added in a future update.', { x: 1, y: 2 });

      // --- Historical Trend Comparisons ---
      const historicalSlide = pptx.addSlide();
      historicalSlide.addText('Historical Trend Comparisons', { x: 1, y: 1, fontSize: 24, bold: true });
      historicalSlide.addText('Historical trend comparisons will be added in a future update.', { x: 1, y: 2 });

      // --- Add Footers ---
      const firstRespondent = responses[0] || {};
      const respondentName = firstRespondent.respondentName || 'N/A';
      const respondentLocation = firstRespondent.location ? `${firstRespondent.location.city}, ${firstRespondent.location.country}` : 'N/A';
      const respondentResponse = firstRespondent.response ? JSON.stringify(firstRespondent.response).substring(0, 50) + '...' : 'N/A';

      pptx.slides.forEach((slide, index) => {
        slide.addText(
          `Respondent: ${respondentName} | Location: ${respondentLocation} | Response: ${respondentResponse}`,
          { x: 0.5, y: 5.2, fontSize: 8, color: '666666' }
        );
        slide.addText(
            `Slide ${index + 1}`,
            { x: 9, y: 5.2, fontSize: 8, color: '666666' }
        );
      });

      const buffer = await pptx.write('buffer');
      res.setHeader('Content-Disposition', `attachment; filename=${report.title}.pptx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.send(buffer);
    } else if (format === 'xlsx') {
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Description', key: 'description', width: 50 },
      ];

      worksheet.addRow({id: report._id, title: report.title, description: report.description});

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Disposition', `attachment; filename=${report.title}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Disposition', `attachment; filename=${report.title}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfData);
      });

      // --- PDF Landing Page ---
      doc.image(Buffer.from(logo, 'base64'), {
        fit: [100, 100],
        align: 'center',
        valign: 'center'
      });
      doc.moveDown(2);
      doc.fontSize(25).text(survey.title, {
        align: 'center'
      });

      // --- PDF Content ---
      report.sections.forEach((section, pageIndex) => {
        doc.addPage();
        doc.fontSize(20).text(section.title, {
          underline: true

        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid format specified' });
    }

    res.end(file);

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

