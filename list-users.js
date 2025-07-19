import { connectToServer, getDb } from './server/utils/db.js';

async function listUsers() {
  try {
    await connectToServer();
    const db = getDb();
    const users = await db.collection('users').find({}).toArray();
    console.log(users);
    process.exit(0);
  } catch (err) {
    console.error('Failed to list users:', err);
    process.exit(1);
  }
}

listUsers();
