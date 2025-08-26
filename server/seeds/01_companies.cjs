const { ObjectId } = require('mongodb');

const companies = [
  {
    _id: new ObjectId('60d5ecb3e7a5c53df0c7b6a1'),
    name: 'Innovate Inc.',
    website: 'https://innovateinc.com',
    email: 'contact@innovateinc.com',
    phone: '123-456-7890',
    address: '123 Tech Street, Silicon Valley, CA',
    employeeCount: 250,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId('60d5ecb3e7a5c53df0c7b6a2'),
    name: 'Synergy Corp.',
    website: 'https://synergycorp.com',
    email: 'info@synergycorp.com',
    phone: '098-765-4321',
    address: '456 Business Ave, New York, NY',
    employeeCount: 500,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const seed = async (knex) => {
  // Since we are not using Knex's schema builder for this NoSQL-like setup,
  // and we're using a MongoDB driver via `getDb`, direct DB operations are needed.
  // This file will serve as a data definition placeholder.
  // The actual seeding logic will be in a main seed runner.
};

module.exports = {
  companies,
  seed
};
