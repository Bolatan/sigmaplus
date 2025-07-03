import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all origins - adjust as needed for production
app.use(cors());

app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API routes
app.get('/api/surveys', (req, res) => {
  res.json({
    data: [
      { id: 1, status: 'completed', responseCount: 25 },
      { id: 2, status: 'completed', responseCount: 30 },
      { id: 3, status: 'in_progress', responseCount: 15 }
    ]
  });
});

app.get('/api/reports', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Q1 Report' },
      { id: 2, name: 'Q2 Report' },
      { id: 3, name: 'Customer Satisfaction Report' }
    ]
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});