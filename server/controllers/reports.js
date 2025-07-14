import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import PDFDocument from 'pdfkit';
import pptxgen from 'pptxgenjs';
import Excel from 'exceljs';
import fs from 'fs';
import { createStudyOverviewSlide, createLandingPageSlide } from '../templates/study-overview.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import Reporting from '../reporting/index.js';

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

    // Access control
    if (req.user.role === 'client' && (!report.companyId || report.companyId.toString() !== req.user.companyId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const exporter = new Exporter(report);
    let file;

    switch (format) {
      case 'pptx':
        file = await exporter.toPPTX();
        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${report.title}.pptx"`,
        });
        break;
      case 'xlsx':
        file = await exporter.toXLSX();
        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${report.title}.xlsx"`,
        });
        break;
      case 'pdf':
        file = await exporter.toPDF();
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${report.title}.pdf"`,
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

function createBrandAwarenessSlide(pptx, survey, responses) {
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

function createBrandUsageSlide(pptx, survey, responses) {
  const slide = pptx.addSlide();
  slide.addText('Brand Usage & Purchase Behavior', { x: 1, y: 1, fontSize: 24, bold: true });
  slide.addText('Data and visualizations for this section will be added in a future update.', { x: 1, y: 2 });
}

function createCustomerSatisfactionSlide(pptx, survey, responses) {
  const slide = pptx.addSlide();
  slide.addText('Customer Satisfaction & Loyalty Metrics', { x: 1, y: 1, fontSize: 24, bold: true });
  slide.addText('Data and visualizations for this section will be added in a future update.', { x: 1, y: 2 });
}

async function createChart(responses) {
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
