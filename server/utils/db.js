import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://bolatan:Ogbogbo123@cluster0.vzjwn4g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Fallback for local dev if URI not in env

let db;

const connectToServer = async () => {
  if (db) {
    return db;
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    // Explicitly set database name. Replace 'survey_app' if your DB has a different name.
    // If your connection string already specifies the database, client.db() without args might be sufficient.
    // e.g., mongodb+srv://user:pass@host/yourDbName?retryWrites=true
    db = client.db("survey_app");
    await db.createCollection("projects").catch(err => {
      if (err.codeName !== 'NamespaceExists') {
        throw err;
      }
    });
    console.log("Successfully connected to MongoDB database: survey_app");
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
