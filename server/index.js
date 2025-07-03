const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for the frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default dev server port
  credentials: true
}));

app.use(express.json());

// Basic routes for testing
app.get('/surveys', (req, res) => {
  res.json({
    data: [
      { id: 1, status: 'completed', responseCount: 25 },
      { id: 2, status: 'completed', responseCount: 30 },
      { id: 3, status: 'in_progress', responseCount: 15 }
    ]
  });
});

app.get('/reports', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Q1 Report' },
      { id: 2, name: 'Q2 Report' },
      { id: 3, name: 'Customer Satisfaction Report' }
    ]
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
