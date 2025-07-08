import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToServer, getDb } from './utils/db.js';

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

// API routes
app.get('/api/surveys', async (req, res) => {
  try {
    const db = getDb();
    const surveys = await db.collection('surveys').find({}).toArray();
    res.json({ data: surveys });
  } catch (err) {
    console.error("Failed to fetch surveys:", err);
    res.status(500).json({ error: "Failed to fetch surveys from database" });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const db = getDb();
    const reports = await db.collection('reports').find({}).toArray();
    res.json({ data: reports });
  } catch (err) {
    console.error("Failed to fetch reports:", err);
    res.status(500).json({ error: "Failed to fetch reports from database" });
  }
});

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