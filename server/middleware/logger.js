import { getDb } from '../utils/db.js';

export const logger = async (req, res, next) => {
  const db = getDb();
  const { method, url, user } = req;
  const log = {
    method,
    url,
    userId: user ? user.id : 'anonymous',
    timestamp: new Date(),
  };

  try {
    await db.collection('audit-logs').insertOne(log);
  } catch (err) {
    console.error('Failed to log request:', err);
  }

  next();
};
