import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.js';
import argon2 from 'argon2';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

jest.mock('./utils/db.js', () => {
  const originalModule = jest.requireActual('./utils/db.js');
  const mockDb = {
    collection: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
  };
  return {
    ...originalModule,
    getDb: jest.fn(() => mockDb),
  };
});

import { getDb } from './utils/db.js';

describe('Auth Routes', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = getDb();
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    mockDb.collection('users').findOne.mockResolvedValue(null);
    mockDb.collection('users').insertOne.mockResolvedValue({ insertedId: '123' });
    mockDb.collection('users').findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'agent',
    });

    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'agent',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register a user with an existing email', async () => {
    mockDb.collection('users').findOne.mockResolvedValue({ email: 'test@example.com' });

    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'Password123',
        role: 'agent',
      });

    expect(res.statusCode).toEqual(400);
  });

  it('should login an existing user', async () => {
    const hashedPassword = await argon2.hash('Password123');
    mockDb.collection('users').findOne.mockResolvedValue({
      _id: '123',
      email: 'test@example.com',
      password: hashedPassword,
      status: 'active',
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user with a case-insensitive email', async () => {
    const hashedPassword = await argon2.hash('Password123');
    mockDb.collection('users').findOne.mockResolvedValue({
      _id: '123',
      email: 'test@example.com',
      password: hashedPassword,
      status: 'active',
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with an incorrect password', async () => {
    const hashedPassword = await argon2.hash('Password123');
    mockDb.collection('users').findOne.mockResolvedValue({
      _id: '123',
      email: 'test@example.com',
      password: hashedPassword,
      status: 'active',
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123',
      });

    expect(res.statusCode).toEqual(400);
  });

  it('should refresh an expired token', async () => {
    const user = {
      _id: '60d5ec49e03f4a0015c4a2ab', // Using a valid ObjectId hex string
      email: 'test@example.com',
      role: 'agent',
      status: 'active',
    };

    // Generate an expired token
    const expiredToken = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '-1h' });

    mockDb.collection('users').findOne.mockResolvedValue(user);

    const res = await request(app)
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).not.toEqual(expiredToken);
  });
});
