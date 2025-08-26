const { ObjectId } = require('mongodb');
const argon2 = require('argon2');

// Hashing passwords is an async operation. We need to pre-hash them.
const createUsers = async () => {
  const hashedPasswordAdmin = await argon2.hash('password123');
  const hashedPasswordClient = await argon2.hash('password123');

  return [
    {
      _id: new ObjectId('60d5f2c5e7a5c53df0c7b6a3'),
      name: 'Admin User',
      username: 'adminuser',
      email: 'admin@example.com',
      password: hashedPasswordAdmin,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId('60d5f2c5e7a5c53df0c7b6a4'),
      name: 'Client User',
      username: 'clientuser',
      email: 'client@innovateinc.com',
      password: hashedPasswordClient,
      role: 'client',
      companyId: new ObjectId('60d5ecb3e7a5c53df0c7b6a1'), // Link to Innovate Inc.
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectId('60d5f2c5e7a5c53df0c7b6a5'),
      name: 'Agent User',
      username: 'agentuser',
      email: 'agent@synergycorp.com',
      password: hashedPasswordClient, // Reusing for simplicity
      role: 'agent',
      companyId: new ObjectId('60d5ecb3e7a5c53df0c7b6a2'), // Link to Synergy Corp.
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
};

const seed = async (knex) => {
    // This file is a data definition placeholder.
    // The actual seeding logic will be in a main seed runner.
};

module.exports = {
  createUsers,
  seed
};
