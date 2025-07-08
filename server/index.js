import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb'; // Import ObjectId
import { connectToServer, getDb } from './utils/db.js';
import authRoutes from './routes/auth.js';
import { verifyToken, authorizeRole } from './middleware/auth.js';
import { body, validationResult } from 'express-validator'; // Import for validation

import surveyRoutes from './routes/surveys.js';
import userRoutes from './routes/users.js'; // Import user routes
// import reportRoutes from './routes/reports.js';
// import companyRoutes from './routes/companies.js';


// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all origins - adjust as needed for production
app.use(cors());

app.use(express.json());

// Serve static files from the React app build directory
// This should come after API routes if you have specific backend routes for static assets,
// or if your API routes might conflict with static file paths.
// For a typical setup where /api/* is backend and everything else is frontend, this order is fine.
app.use(express.static(path.join(__dirname, '..', 'dist')));

// --- Auth Routes ---
app.use('/api/auth', authRoutes); // Mount authentication routes

// --- Application API Routes ---
app.use('/api/surveys', surveyRoutes);
app.use('/api/users', userRoutes); // Mount user routes
// app.use('/api/reports', reportRoutes);
// app.use('/api/companies', companyRoutes);

// --- Stats Routes ---
// GET /api/stats/survey-statuses - Get counts of surveys by status
app.get('/api/stats/survey-statuses', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const surveyStatusStats = await db.collection('surveys').aggregate([
      {
        $group: {
          _id: "$status", // Group by the status field
          count: { $sum: 1 } // Count documents in each group
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          status: "$_id", // Rename _id to status
          count: 1 // Include the count
        }
      }
    ]).toArray();

    res.json({ data: surveyStatusStats });
  } catch (err) {
    console.error("Failed to fetch survey status stats:", err);
    res.status(500).json({ error: "Failed to fetch survey status statistics" });
  }
});


// --- Protected API Routes (that are still in server/index.js) ---
// Consider moving these to their respective route files as well for better organization.

// Reports API: Accessible to any authenticated user
// TODO: Move to server/routes/reports.js
app.get('/api/reports', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const reports = await db.collection('reports').find({}).toArray();
    res.json({ data: reports });
  } catch (err) {
    console.error("Failed to fetch reports:", err);
    res.status(500).json({ error: "Failed to fetch reports from database" });
  }
});

// Users API routes are now handled by server/routes/users.js
// The GET /api/users and GET /api/users/:id that were here have been moved.

// Companies API: Accessible to any authenticated user
app.get('/api/companies', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const companies = await db.collection('companies').find({}).toArray();
    res.json({ data: companies });
  } catch (err) {
    console.error("Failed to fetch companies:", err);
    res.status(500).json({ error: "Failed to fetch companies from database" });
  }
});

app.get('/api/companies/:id', verifyToken, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid company ID format" });
    }
    const company = await db.collection('companies').findOne({ _id: new ObjectId(id) });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json({ data: company });
  } catch (err) {
    console.error("Failed to fetch company:", err);
    res.status(500).json({ error: "Failed to fetch company from database" });
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
    });
  })
  .catch(err => {
    console.error("Failed to connect to the database. Server not started.", err);
    process.exit(1); // Exit if DB connection fails
  });