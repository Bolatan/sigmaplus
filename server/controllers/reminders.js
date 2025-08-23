import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { ApiError } from '../utils/ApiError.js';

export const createReminder = async (req, res, next) => {
  try {
    const db = getDb();
    const { surveyId, scheduledAt, subject, body } = req.body;
    const { id: userId } = req.user;

    if (!ObjectId.isValid(surveyId)) {
      throw new ApiError(400, 'Invalid Survey ID format.');
    }

    const newReminder = {
      surveyId: new ObjectId(surveyId),
      createdBy: new ObjectId(userId),
      scheduledAt: new Date(scheduledAt),
      subject,
      body,
      status: 'scheduled',
      createdAt: new Date(),
    };

    const result = await db.collection('reminders').insertOne(newReminder);
    res.status(201).json({ status: 'success', data: { reminderId: result.insertedId } });
  } catch (error) {
    next(error);
  }
};

export const getRemindersForSurvey = async (req, res, next) => {
  try {
    const db = getDb();
    const { surveyId } = req.params;

    if (!ObjectId.isValid(surveyId)) {
      throw new ApiError(400, 'Invalid Survey ID format.');
    }

    const reminders = await db.collection('reminders').find({ surveyId: new ObjectId(surveyId) }).toArray();
    res.json({ status: 'success', data: { reminders } });
  } catch (error) {
    next(error);
  }
};
