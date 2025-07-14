import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

// @desc    Generate a new report
// @route   POST /api/reports
// @access  Private (Admin, Agent)
export const generateReport = async (req, res) => {
  try {
    const db = getDb();
    const { surveyId, title } = req.body;
    const reportsCollection = db.collection('reports');

    // Basic validation
    if (!ObjectId.isValid(surveyId)) {
      return res.status(400).json({ error: 'Invalid survey ID format' });
    }

    // TODO: Add logic here to actually generate the report content
    // based on the survey responses. For now, we'll just create a
    // placeholder report document.

    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const newReport = {
      title,
      surveyId: new ObjectId(surveyId),
      companyId: req.user.companyId, // Assuming agent/admin has companyId
      generatedBy: new ObjectId(req.user.id),
      createdAt: new Date(),
      status: 'completed', // or 'generating'
      sections: [
        {
          id: 'study-overview',
          title: 'Study Overview',
          order: 1,
          content: [],
          projectName: survey.title,
          background: survey.description,
          objectives: 'To understand customer feedback',
          methodology: 'Online survey',
        },
        {
          id: 'respondent-profile',
          title: 'Respondent Profile',
          order: 2,
          content: [],
        },
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          order: 3,
          content: [],
        },
        {
          id: 'core-insight-areas',
          title: 'Core Insight Areas',
          order: 4,
          content: [],
        },
        {
          id: 'regional-findings',
          title: 'Regional and Outlet-Level Findings',
          order: 5,
          content: [],
        },
        {
          id: 'recommendations',
          title: 'Recommendations',
          order: 6,
          content: [],
        },
      ],
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

import PDFDocument from 'pdfkit';
import pptxgen from 'pptxgenjs';
import Excel from 'exceljs';
import { createStudyOverviewSlide } from '../templates/study-overview.js';

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    const db = getDb();
    const reportsCollection = db.collection('reports');
    const { id } = req.params;
    const { format } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const report = await reportsCollection.findOne({ _id: new ObjectId(id) });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(report.surveyId) });
    const responses = await db.collection('responses').find({ surveyId: new ObjectId(report.surveyId) }).toArray();
    const user = await db.collection('users').findOne({ _id: new ObjectId(report.generatedBy) });
    const company = await db.collection('companies').findOne({ _id: new ObjectId(report.companyId) });
    const client = await db.collection('users').findOne({ _id: new ObjectId(report.clientId) });

    // Access control: Ensure client can only access their own reports
    if (req.user.role === 'client' && req.user.companyId) {
      if (!report.companyId || report.companyId.toString() !== req.user.companyId.toString()) {
        return res.status(403).json({ error: 'Access denied to this report' });
      }
    }

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
      // --- Core Insight Areas ---
      createBrandAwarenessSlide(pptx, survey, responses);
      createBrandUsageSlide(pptx, survey, responses);
      createCustomerSatisfactionSlide(pptx, survey, responses);
      // ... and so on for the other core insight areas

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

      const buffer = await pptx.write('buffer');
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment;filename=${report.title}.pptx`,
      });
      res.end(buffer);
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
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment;filename=${report.title}.xlsx`,
      });
      res.end(buffer);
    } else {
      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
          'Content-Length': Buffer.byteLength(pdfData),
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment;filename=${report.title}.pdf`,
        }).end(pdfData);
      });

      doc.fontSize(25).text(report.title, {
        align: 'center'
      });

      doc.moveDown();

      report.sections.forEach(section => {
        doc.fontSize(20).text(section.type, {
          underline: true
        });
        doc.fontSize(12).text(section.content);
        doc.moveDown();
      });

      doc.end();
    }

  } catch (err) {
    console.error(`Failed to fetch report ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};


// @desc    Update a report's metadata (e.g., title)
// @route   PUT /api/reports/:id
// @access  Private (Admin, Agent)
export const updateReport = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { title } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid report ID format' });
    }

    const updateDoc = {
      $set: {
        ...(title && { title }),
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

