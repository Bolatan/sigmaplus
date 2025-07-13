import { bulkUploadSurveyResponses } from '../controllers/surveys.js';
import { getDb, closeDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { Readable } from 'stream';
import assert from 'assert';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const mockRequest = (file, params, user) => ({
  file,
  params,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const mockNext = (err) => {
  if (err) {
    console.error('Next called with error:', err);
    throw err;
  }
};

describe('bulkUploadSurveyResponses', function() {
  this.timeout(120000);

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;
  });

  after(async () => {
    await closeDb();
    await mongoServer.stop();
  });

  it('should correctly import a valid response', async () => {
    const db = await getDb();
    const surveyId = new ObjectId();
    const userId = new ObjectId();

    await db.collection('surveys').insertOne({
      _id: surveyId,
      status: 'active',
      questions: [
        { id: 'q1', type: 'rating', maxRating: 5 },
        { id: 'q2', type: 'image-choice', options: ['a', 'b', 'c'] },
        { id: 'q3', type: 'file-upload' },
      ],
    });

    const csvData = 'q1,q2,q3\n4,a,http://example.com/file.jpg';
    const req = mockRequest(
      { buffer: Buffer.from(csvData) },
      { surveyId: surveyId.toString() },
      { id: userId.toString() }
    );
    const res = mockResponse();

    await bulkUploadSurveyResponses(req, res, mockNext);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.importedCount, 1);

    const response = await db.collection('responses').findOne();
    assert.strictEqual(response.responseData.q1, 4);
    assert.strictEqual(response.responseData.q2, 'a');
    assert.strictEqual(response.responseData.q3, 'http://example.com/file.jpg');
  });

  it('should skip rows with invalid data', async () => {
    const db = await getDb();
    const surveyId = new ObjectId();
    const userId = new ObjectId();
    await db.collection('surveys').insertOne({
      _id: surveyId,
      status: 'active',
      questions: [
        { id: 'q1', type: 'rating', maxRating: 5 },
        { id: 'q2', type: 'image-choice', options: ['a', 'b', 'c'] },
        { id: 'q3', type: 'file-upload' },
      ],
    });

    const csvData = 'q1,q2,q3\n6,a,http://example.com/file.jpg\n4,d,http://example.com/file.jpg\n4,a,not_a_url';
    const req = mockRequest(
      { buffer: Buffer.from(csvData) },
      { surveyId: surveyId.toString() },
      { id: userId.toString() }
    );
    const res = mockResponse();

    await bulkUploadSurveyResponses(req, res, mockNext);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.importedCount, 0);
    assert.strictEqual(res.body.skippedCount, 3);
  });
});
