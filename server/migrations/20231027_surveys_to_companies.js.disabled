// Migration to change the relationship between surveys and companies
// from one-to-one to many-to-many

import { connectToServer, getDb } from '../utils/db.js';

export const up = async (knex) => {
  await connectToServer();
  const db = getDb();
  const surveys = await db.collection('surveys').find({ companyId: { $exists: true } }).toArray();

  for (const survey of surveys) {
    const companyId = survey.companyId;
    await db.collection('surveys').updateOne(
      { _id: survey._id },
      {
        $set: { companyIds: [companyId] },
        $unset: { companyId: "" }
      }
    );
  }

  console.log("Migration 'up' completed successfully.");
};

export const down = async (knex) => {
  await connectToServer();
  const db = getDb();
  const surveys = await db.collection('surveys').find({ companyIds: { $exists: true } }).toArray();

  for (const survey of surveys) {
    const companyId = survey.companyIds[0];
    await db.collection('surveys').updateOne(
      { _id: survey._id },
      {
        $set: { companyId: companyId },
        $unset: { companyIds: "" }
      }
    );
  }

  console.log("Migration 'down' completed successfully.");
};
