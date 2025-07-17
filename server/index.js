import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

console.log('JWT_SECRET:', process.env.JWT_SECRET);

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb'; // Import ObjectId
import { connectToServer, getDb } from './utils/db.js';
import authRoutes from './routes/auth.js';
import { verifyToken, authorizeRole } from './middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { logger } from './middleware/logger.js';
import fs from 'fs';
import tmp from 'tmp';

import surveyRoutesFunction from './routes/surveys.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import reportRoutes from './routes/reports.js'; // Uncommented
import projectRoutes from './routes/projects.js';
import cronRoutes from './routes/cron.js';
import scheduleReportGeneration from './services/reportingService.js';
import multer from 'multer';
import Reporting from './reporting/index.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';


// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all origins - adjust as needed for production
app.use(cors());

app.use(express.json());
app.use(logger);

// Multer configuration for file uploads (using memory storage)
const storage = multer.memoryStorage(); // Stores file in memory as Buffer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => { // Basic CSV filter
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are allowed!'), false);
    }
  }
});
// Make 'upload' instance available to routes if needed, or pass it directly in route definitions.
// For now, it's defined here and will be used in server/routes/surveys.js by importing it or passing.
// Let's plan to import it in the route file. We'll make it exportable if needed, or redefine locally in route.
// For simplicity in this step, we'll assume routes can access this 'upload' if it were exported,
// but the plan is to use it directly when defining the route in survey.js, so this definition is a prerequisite.

// Serve static files from the React app build directory
// This should come after API routes if you have specific backend routes for static assets,
// or if your API routes might conflict with static file paths.
// For a typical setup where /api/* is backend and everything else is frontend, this order is fine.
app.use(express.static(path.join(__dirname, '..', 'dist')));

// --- Auth Routes ---
app.use('/api/auth', authRoutes); // Mount authentication routes

// --- Application API Routes ---
app.use('/api/surveys', surveyRoutesFunction(upload));
app.use('/api/projects', projectRoutes(upload));
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/cron', cronRoutes);

import statsRoutes from './routes/stats.js';
app.use('/api/stats', statsRoutes);


// --- Protected API Routes (that are still in server/index.js) ---
// Consider moving these to their respective route files as well for better organization.

// The GET /api/reports route is now handled by server/routes/reports.js
// // Reports API: Accessible to any authenticated user
// // TODO: Move to server/routes/reports.js
// app.get('/api/reports', verifyToken, async (req, res) => {
//   try {
//     const db = getDb();
//     const reports = await db.collection('reports').find({}).toArray();
//     res.json({ data: reports });
//   } catch (err) {
//     console.error("Failed to fetch reports:", err);
//     res.status(500).json({ error: "Failed to fetch reports from database" });
//   }
// });

// Users API routes are now handled by server/routes/users.js
// The GET /api/users and GET /api/users/:id that were here have been moved.

// Companies API routes are now handled by server/routes/companies.js
// The GET /api/companies and GET /api/companies/:id that were here have been moved.

app.get('/api/test-pdf', async (req, res) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 30;
  page.drawText('Hello World!', {
    x: 50,
    y: height - 4 * fontSize,
    font,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  const pdfBytes = await pdfDoc.save();
  const tmpFile = tmp.fileSync({ postfix: '.pdf' });
  fs.writeFileSync(tmpFile.name, pdfBytes);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=test.pdf');
  res.sendFile(tmpFile.name, (err) => {
    if (err) {
      console.error('Error sending PDF file:', err);
      res.status(500).json({ error: 'Failed to send PDF file' });
    }
    tmpFile.removeCallback();
  });
});

app.get('/api/test-report', async (req, res) => {
  const { format } = req.query;
  if (format === 'pdf') {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 30;
    page.drawText('Hello World!', {
      x: 50,
      y: height - 4 * fontSize,
      font,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    const tmpFile = tmp.fileSync({ postfix: '.pdf' });
    fs.writeFileSync(tmpFile.name, pdfBytes);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=test.pdf');
    res.sendFile(tmpFile.name, (err) => {
      if (err) {
        console.error('Error sending PDF file:', err);
        res.status(500).json({ error: 'Failed to send PDF file' });
      }
      tmpFile.removeCallback();
    });
  } else if (format === 'pptx') {
    const pptxgen = await import('pptxgenjs');
    const pptx = new pptxgen.default();
    const slide = pptx.addSlide();
    slide.addText('Hello World', { x: 1, y: 1, fontSize: 18 });
    res.setHeader('Content-Disposition', `attachment; filename=test.pptx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    const stream = await pptx.stream();
    stream.pipe(res);
  } else {
    res.status(400).send('Invalid format');
  }
});

// --- Frontend Catchall ---
// The "catchall" handler: for any request that doesn't
// match an API route or a static file, send back React's index.html file.
// This needs to be after all other specific GET routes.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start the server only after successful DB connection
connectToServer()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port} and connected to MongoDB.`);
      scheduleReportGeneration();
    });
  })
  .catch(err => {
    console.error("Failed to connect to the database. Server not started.", err);
    process.exit(1); // Exit if DB connection fails
  });