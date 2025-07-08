import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb'; // Import ObjectId
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

// Users API Endpoints
app.get('/api/users', async (req, res) => {
  try {
    const db = getDb();
    const users = await db.collection('users').find({}).toArray();
    res.json({ data: users });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users from database" });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ data: user });
  } catch (err) {
    console.error("Failed to fetch user:", err);
    res.status(500).json({ error: "Failed to fetch user from database" });
  }
});

// Companies API Endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const db = getDb();
    const companies = await db.collection('companies').find({}).toArray();
    res.json({ data: companies });
  } catch (err) {
    console.error("Failed to fetch companies:", err);
    res.status(500).json({ error: "Failed to fetch companies from database" });
  }
});

app.get('/api/companies/:id', async (req, res) => {
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