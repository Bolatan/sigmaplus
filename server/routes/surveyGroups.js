import express from 'express';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { verifyToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Create a new survey group
router.post('/', verifyToken, authorizeRole(['admin', 'agent']), async (req, res) => {
  const { name, surveyIds } = req.body;
  if (!name || !surveyIds || !Array.isArray(surveyIds)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const db = getDb();
    const newGroup = {
      name,
      surveyIds: surveyIds.map(id => new ObjectId(id)),
      createdAt: new Date(),
    };
    const result = await db.collection('survey_groups').insertOne(newGroup);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    console.error('Failed to create survey group:', err);
    res.status(500).json({ error: 'Failed to create survey group' });
  }
});

// Get all survey groups
router.get('/', verifyToken, authorizeRole(['admin', 'agent']), async (req, res) => {
  try {
    const db = getDb();
    const groups = await db.collection('survey_groups').find({}).toArray();
    res.json(groups);
  } catch (err) {
    console.error('Failed to get survey groups:', err);
    res.status(500).json({ error: 'Failed to get survey groups' });
  }
});

// Get a survey group
router.get('/:id', verifyToken, authorizeRole(['admin', 'agent']), async (req, res) => {
  try {
    const db = getDb();
    const group = await db.collection('survey_groups').findOne({ _id: new ObjectId(req.params.id) });
    if (!group) {
      return res.status(404).json({ error: 'Survey group not found' });
    }
    res.json(group);
  } catch (err) {
    console.error('Failed to get survey group:', err);
    res.status(500).json({ error: 'Failed to get survey group' });
  }
});

// Update a survey group
router.put('/:id', verifyToken, authorizeRole(['admin', 'agent']), async (req, res) => {
  const { name, surveyIds } = req.body;
  if (!name || !surveyIds || !Array.isArray(surveyIds)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const db = getDb();
    const updatedGroup = {
      name,
      surveyIds: surveyIds.map(id => new ObjectId(id)),
    };
    const result = await db.collection('survey_groups').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updatedGroup }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Survey group not found' });
    }
    res.json({ message: 'Survey group updated successfully' });
  } catch (err) {
    console.error('Failed to update survey group:', err);
    res.status(500).json({ error: 'Failed to update survey group' });
  }
});

export default router;
