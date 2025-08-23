import { getDb } from '../utils/db.js';

export const createSurvey = async (req, res, next) => {
  try {
    const db = getDb();
    const { title, description, questions } = req.body;

    const newSurvey = {
      title,
      description,
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      responseCount: 0,
    };

    const result = await db.collection('surveys').insertOne(newSurvey);
    res.status(201).json({ status: 'success', data: { surveyId: result.insertedId } });
  } catch (error) {
    next(error);
  }
};
