import { getDb } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ObjectId } from 'mongodb';

// Get all questions from the bank
export const getQuestionBank = async (req, res, next) => {
  try {
    const db = getDb();
    const questions = await db.collection('question_bank').find({}).toArray();
    res.json({ status: 'success', data: questions });
  } catch (err) {
    console.error('Failed to fetch question bank', err);
    next(new ApiError(500, `Failed to fetch question bank: ${err.message}`));
  }
};

// Add a new question to the bank
export const addQuestionToBank = async (req, res, next) => {
  const { questionText, questionType, options, category, tags } = req.body;

  if (!questionText || !questionType) {
    return next(new ApiError(400, 'Question text and type are required.'));
  }

  try {
    const db = getDb();
    const newQuestion = {
      questionText,
      questionType,
      options: options || [],
      category: category || 'General',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('question_bank').insertOne(newQuestion);
    res.status(201).json({ status: 'success', data: { insertedId: result.insertedId } });
  } catch (err) {
    console.error('Failed to add question to bank', err);
    next(new ApiError(500, `Failed to add question to bank: ${err.message}`));
  }
};

// Update a question in the bank
export const updateQuestionInBank = async (req, res, next) => {
  const { id } = req.params;
  const { questionText, questionType, options, category, tags } = req.body;

  if (!ObjectId.isValid(id)) {
    return next(new ApiError(400, 'Invalid question ID.'));
  }

  try {
    const db = getDb();
    const updateFields = { updatedAt: new Date() };
    if (questionText) updateFields.questionText = questionText;
    if (questionType) updateFields.questionType = questionType;
    if (options) updateFields.options = options;
    if (category) updateFields.category = category;
    if (tags) updateFields.tags = tags;

    const result = await db.collection('question_bank').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return next(new ApiError(404, 'Question not found.'));
    }
    res.json({ status: 'success', message: 'Question updated successfully.' });
  } catch (err) {
    console.error('Failed to update question in bank', err);
    next(new ApiError(500, `Failed to update question in bank: ${err.message}`));
  }
};

// Delete a question from the bank
export const deleteQuestionFromBank = async (req, res, next) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return next(new ApiError(400, 'Invalid question ID.'));
  }

  try {
    const db = getDb();
    const result = await db.collection('question_bank').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return next(new ApiError(404, 'Question not found.'));
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete question from bank', err);
    next(new ApiError(500, `Failed to delete question from bank: ${err.message}`));
  }
};
