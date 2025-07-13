import { MongoClient } from 'mongodb';

let db;
let client;

const connectToServer = async (uri = process.env.MONGODB_URI || "mongodb+srv://bolatan:Ogbogbo123@cluster0.vzjwn4g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0") => {
  if (db) {
    return db;
  }
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("survey_app");
    console.log("Successfully connected to MongoDB database: survey_app");
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
};

const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectToServer first.");
  }
  return db;
};

const closeDb = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
};

export { connectToServer, getDb, closeDb };
