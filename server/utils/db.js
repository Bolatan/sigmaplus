import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Fallback for local dev if URI not in env

let db;

const connectToServer = async () => {
  if (db) {
    return db;
  }
  try {
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 60000,
    });
    await client.connect();
    // The database name is now taken from the connection string.
    db = client.db();
    await db.createCollection("projects").catch(err => {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
    });
    console.log(`Successfully connected to MongoDB database: ${db.databaseName}`);
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err; // Rethrow error to be caught by server startup logic
  }
};

const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectToServer first.");
  }
  return db;
};

export { connectToServer, getDb };
