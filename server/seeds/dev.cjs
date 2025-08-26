require('dotenv').config();

const { companies } = require('./01_companies.cjs');
const { createUsers } = require('./02_users.cjs');
const { seed: seedQuestionBank } = require('./populate_question_bank.cjs');
const knex = require('../utils/knex.js');

const seedDatabase = async () => {
  let db;
  try {
    console.log('Starting database seeding process...');
    // Dynamically import db.js
    const dbModule = await import('../utils/db.js');
    await dbModule.connectToServer(); // Initialize DB connection
    db = dbModule.getDb();

    // Clear existing collections
    console.log('Clearing existing data...');
    if (db.collection('companies')) {
        await db.collection('companies').deleteMany({});
    }
    if (db.collection('users')) {
        await db.collection('users').deleteMany({});
    }

    console.log('Collections cleared.');

    // Seed Companies
    console.log('Seeding companies...');
    await db.collection('companies').insertMany(companies);
    console.log(`${companies.length} companies seeded.`);

    // Seed Users
    console.log('Seeding users...');
    const usersToSeed = await createUsers();
    await db.collection('users').insertMany(usersToSeed);
    console.log(`${usersToSeed.length} users seeded.`);

    // Seed Question Bank using its own Knex-based seeder
    console.log('Seeding question bank...');
    // await seedQuestionBank(knex);
    console.log('Question bank seeded.');


    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
