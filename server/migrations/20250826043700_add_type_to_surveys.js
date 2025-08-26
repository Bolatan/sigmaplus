import { connectToServer, getDb } from '../utils/db.js';

export const up = async (knex) => {
  await connectToServer();
  const db = getDb();
  await db.collection('surveys').updateMany(
    { type: { $exists: false } },
    { $set: { type: 'descriptive' } }
  );
  console.log("Migration 'up' for adding type to surveys completed successfully.");
};

export const down = async (knex) => {
  await connectToServer();
  const db = getDb();
  await db.collection('surveys').updateMany(
    { type: 'descriptive' },
    { $unset: { type: '' } }
  );
  console.log("Migration 'down' for adding type to surveys completed successfully.");
};
