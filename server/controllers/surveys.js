import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const createSurvey = async (req, res, next) => {
  try {
    const { title, description, questions: inputQuestions, status, companyId: bodyCompanyId, agentId } = req.body;
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

    const db = getDb();

    const validatedQuestions = (inputQuestions || []).map((q, index) => {
      if (!q || typeof q !== 'object') {
        throw new ApiError(400, `Question at index ${index} is not a valid object.`);
      }
      if (!q.id || typeof q.id !== 'string') {
        throw new ApiError(400, `Question at index ${index} is missing a valid 'id'.`);
      }
      if (!q.text || typeof q.text !== 'string' || q.text.trim() === '') {
        throw new ApiError(400, `Question '${q.id}' (index ${index}) must have non-empty 'text'.`);
      }
      if (!q.type || typeof q.type !== 'string' || !['text', 'textarea', 'single-choice', 'multiple-choice', 'rating', 'nps', 'ces', 'image-choice', 'file-upload', 'video'].includes(q.type)) {
        throw new ApiError(400, `Question '${q.id}' (index ${index}) has an invalid 'type'.`);
      }
      if ((q.type === 'single-choice' || q.type === 'multiple-choice' || q.type === 'image-choice') && (!q.options || !Array.isArray(q.options) || q.options.length === 0)) {
        throw new ApiError(400, `Question '${q.id}' (index ${index}) must have at least one option.`);
      }
      if (q.type === 'rating' && (!q.maxRating || typeof q.maxRating !== 'number' || q.maxRating < 2 || q.maxRating > 10)) {
        throw new ApiError(400, `Question '${q.id}' (index ${index}) must have a maxRating between 2 and 10.`);
      }
      if (q.type === 'file-upload' && q.allowedFileTypes && typeof q.allowedFileTypes !== 'string') {
        throw new ApiError(400, `Question '${q.id}' (index ${index}) must have a string for allowedFileTypes.`);
      }
      if (q.type === 'video' && (!q.videoUrl || typeof q.videoUrl !== 'string')) {
        throw new ApiError(400, `Question '${q.id}' (index ${index}) must have a videoUrl.`);
      }
      return {
        id: q.id,
        text: q.text.trim(),
        type: q.type,
        options: q.options && Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
        isRequired: typeof q.isRequired === 'boolean' ? q.isRequired : !!q.isRequired,
        maxRating: q.maxRating,
        allowedFileTypes: q.allowedFileTypes,
        videoUrl: q.videoUrl,
      };
    });

    const newSurveyData = {
      title,
      description: description || '',
      questions: validatedQuestions,
      status: status || 'draft',
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      responseCount: 0,
    };

    if (userRole === 'admin' && bodyCompanyId && ObjectId.isValid(bodyCompanyId)) {
      newSurveyData.companyId = new ObjectId(bodyCompanyId);
    } else if ((userRole === 'agent' || userRole === 'client') && userCompanyId && ObjectId.isValid(userCompanyId)) {
      newSurveyData.companyId = new ObjectId(userCompanyId);
      if (bodyCompanyId && bodyCompanyId !== userCompanyId.toString() && userRole !== 'admin') {
        console.warn(`User ${userId} (role: ${userRole}) attempted to set companyId to ${bodyCompanyId} but is associated with ${userCompanyId}. Using user's companyId.`);
      }
    }

    if (userRole === 'admin' && agentId && ObjectId.isValid(agentId)) {
      newSurveyData.agentId = new ObjectId(agentId);
    }

    const result = await db.collection('surveys').insertOne(newSurveyData);
    const createdSurvey = await db.collection('surveys').findOne({ _id: result.insertedId });

    res.status(201).json({ status: 'success', data: createdSurvey });
  } catch (error) {
    console.error("Error in createSurvey controller:", error);
    next(error);
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    const db = getDb();
    const query = {};
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

    if (userRole === 'client') {
      if (!userCompanyId) {
        return res.json({ status: 'success', data: [] });
      }
      query.companyId = new ObjectId(userCompanyId);
    } else if (userRole === 'agent') {
      query.agentId = new ObjectId(userId);
    }

    const surveysData = await db.collection('surveys').find(query).toArray();
    res.json({ status: 'success', data: surveysData });
  } catch (error) {
    console.error("Error in getSurveys controller:", error);
    next(error);
  }
};

export const getSurveyById = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: surveyId } = req.params;
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

    if (!ObjectId.isValid(surveyId)) {
      throw new ApiError(404, 'Survey not found (invalid ID format)');
    }

    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    
    if (!survey) {
      throw new ApiError(404, 'Survey not found');
    }

    if (userRole === 'client') {
      if (!userCompanyId || !survey.companyId || survey.companyId.toString() !== userCompanyId.toString()) {
        throw new ApiError(403, 'Not authorized to access this survey');
      }
    } else if (userRole === 'agent') {
      if (survey.createdBy.toString() !== userId.toString()) {
        throw new ApiError(403, 'Not authorized to access this survey');
      }
    }
    res.json({ status: 'success', data: survey });
  } catch (error) {
    console.error("Error in getSurveyById controller:", error);
    next(error);
  }
};

export const updateSurvey = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: surveyId } = req.params;
    const { id: userId, role: userRole } = req.user;
    const { title, description, questions: inputQuestions, status, companyId: bodyCompanyId, agentId } = req.body;

    if (!ObjectId.isValid(surveyId)) {
      throw new ApiError(404, 'Survey not found (invalid ID format)');
    }

    const existingSurvey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    if (!existingSurvey) {
      throw new ApiError(404, 'Survey not found');
    }

    if (userRole === 'agent' && existingSurvey.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only update surveys you created.');
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (status !== undefined) updateFields.status = status;

    if (inputQuestions !== undefined) {
      updateFields.questions = (inputQuestions || []).map((q, index) => {
        if (!q || typeof q !== 'object') {
          throw new ApiError(400, `Update: Question at index ${index} is not a valid object.`);
        }
        if (!q.id || typeof q.id !== 'string') {
          throw new ApiError(400, `Update: Question at index ${index} is missing a valid 'id'.`);
        }
        if (!q.text || typeof q.text !== 'string' || q.text.trim() === '') {
          throw new ApiError(400, `Update: Question '${q.id}' (index ${index}) must have non-empty 'text'.`);
        }
        if (!q.type || typeof q.type !== 'string' || !['text', 'textarea', 'single-choice', 'multiple-choice', 'rating', 'nps', 'ces', 'image-choice', 'file-upload', 'video'].includes(q.type)) {
          throw new ApiError(400, `Update: Question '${q.id}' (index ${index}) has an invalid 'type'.`);
        }
        const updatedQuestion = {
          id: q.id,
          text: q.text.trim(),
          type: q.type,
          options: q.options && Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
          isRequired: typeof q.isRequired === 'boolean' ? q.isRequired : !!q.isRequired,
        };

        if (q.type === 'rating') {
          updatedQuestion.maxRating = q.maxRating;
        }
        if (q.type === 'file-upload') {
          updatedQuestion.allowedFileTypes = q.allowedFileTypes;
        }
        if (q.type === 'video') {
          updatedQuestion.videoUrl = q.videoUrl;
        }
        if (q.type === 'image-choice') {
          updatedQuestion.options = q.options;
        }

        return updatedQuestion;
      });
    }

    if (userRole === 'admin' && bodyCompanyId !== undefined) {
        if (bodyCompanyId === null || bodyCompanyId === '') {
            updateFields.companyId = null;
        } else if (ObjectId.isValid(bodyCompanyId)) {
            updateFields.companyId = new ObjectId(bodyCompanyId);
        } else {
            throw new ApiError(400, 'Invalid Company ID format provided for update by admin.');
        }
    }

    if (userRole === 'admin' && agentId !== undefined) {
      if (agentId === null || agentId === '') {
        updateFields.agentId = null;
      } else if (ObjectId.isValid(agentId)) {
        updateFields.agentId = new ObjectId(agentId);
      } else {
        throw new ApiError(400, 'Invalid Agent ID format provided for update by admin.');
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ status: 'fail', message: "No valid fields provided for update." });
    }
    updateFields.updatedAt = new Date();

    const result = await db.collection('surveys').findOneAndUpdate(
      { _id: new ObjectId(surveyId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
        throw new ApiError(404, 'Survey not found or failed to update');
    }
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error("Error in updateSurvey controller:", error);
    next(error);
  }
};

export const deleteSurvey = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: surveyId } = req.params;
    const { id: userId, role: userRole } = req.user;

    if (!ObjectId.isValid(surveyId)) {
      throw new ApiError(404, 'Survey not found (invalid ID format)');
    }

    const existingSurvey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    if (!existingSurvey) {
      throw new ApiError(404, 'Survey not found');
    }

    if (userRole === 'agent' && existingSurvey.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only delete surveys you created.');
    }
     if (userRole !== 'admin' && userRole !== 'agent') {
        throw new ApiError(403, 'Forbidden: You are not authorized to delete surveys.');
    }

    const result = await db.collection('surveys').deleteOne({ _id: new ObjectId(surveyId) });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Survey not found or already deleted');
    }
    res.status(200).json({ status: 'success', message: 'Survey deleted successfully' });
  } catch (error) {
    console.error("Error in deleteSurvey controller:", error);
    next(error);
  }
};

export const submitSurveyResponse = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: surveyIdParam } = req.params;
    const { id: userId } = req.user;
    const { data: responseData, location, demographics, submissionTime } = req.body;

    if (!ObjectId.isValid(surveyIdParam)) {
      throw new ApiError(400, 'Invalid Survey ID format.');
    }
    const surveyObjectId = new ObjectId(surveyIdParam);

    const survey = await db.collection('surveys').findOne({ _id: surveyObjectId });
    if (!survey) {
      throw new ApiError(404, 'Survey not found.');
    }
    if (survey.status !== 'active') {
      throw new ApiError(400, `Survey is not active. Current status: ${survey.status}.`);
    }

    const existingResponse = await db.collection('responses').findOne({
      surveyId: surveyObjectId,
      userId: new ObjectId(userId),
    });

    if (existingResponse) {
      throw new ApiError(400, 'You have already submitted a response for this survey.');
    }

    const newResponse = {
      surveyId: surveyObjectId,
      userId: new ObjectId(userId),
      responseData: responseData,
      submittedAt: new Date(),
      submissionTime: submissionTime || null,
      isFlagged: submissionTime && submissionTime < 5000, // Flag if submission time is less than 5 seconds
    };
    if (location) newResponse.location = location;
    if (demographics) newResponse.demographics = demographics;

    const insertResult = await db.collection('responses').insertOne(newResponse);

    await db.collection('surveys').updateOne(
      { _id: surveyObjectId },
      { $inc: { responseCount: 1 }, $set: { updatedAt: new Date() } }
    );

    const createdResponse = await db.collection('responses').findOne({ _id: insertResult.insertedId });

    res.status(201).json({ status: 'success', data: createdResponse });

  } catch (error) {
    console.error("Error in submitSurveyResponse controller:", error);
    if (error instanceof ApiError) {
        next(error);
    } else {
        next(new ApiError(500, error.message || 'Failed to submit survey response.'));
    }
  }
};

export const bulkUploadSurveyResponses = async (req, res, next) => {
  const { surveyId: surveyIdParam } = req.params;
  const { id: uploaderUserId } = req.user;

  if (!req.file) {
    return next(new ApiError(400, 'No CSV file uploaded.'));
  }

  if (!ObjectId.isValid(surveyIdParam)) {
    return next(new ApiError(400, 'Invalid Survey ID format.'));
  }
  const surveyObjectId = new ObjectId(surveyIdParam);

  const db = getDb();

  try {
    const survey = await db.collection('surveys').findOne({ _id: surveyObjectId });
    if (!survey) {
      return next(new ApiError(404, 'Survey not found.'));
    }
    if (survey.status !== 'active') {
      return next(new ApiError(400, `Survey is not active. Current status: ${survey.status}. Cannot upload responses.`));
    }

    const responsesToInsert = [];
    let processedRows = 0;
    let skippedRows = 0;
    const errorsInRows = [];

    const stream = Readable.from(req.file.buffer);
    stream
      .pipe(csv())
      .on('data', (row) => {
        processedRows++;
        try {
          const responseData = { ...row };
          let location, demographics;
          if (responseData.location_city || responseData.location_state) {
            location = { city: responseData.location_city, state: responseData.location_state };
            delete responseData.location_city;
            delete responseData.location_state;
          }
          if (responseData.demographics_age || responseData.demographics_gender) {
            demographics = { age: responseData.demographics_age, gender: responseData.demographics_gender };
            delete responseData.demographics_age;
            delete responseData.demographics_gender;
          }

          if (Object.keys(responseData).length === 0) {
            throw new Error('Row has no response data.');
          }

          const newResponse = {
            surveyId: surveyObjectId,
            userId: new ObjectId(uploaderUserId),
            responseData: responseData,
            submittedAt: new Date(),
            uploadBatchId: new ObjectId(),
          };
          if (location) newResponse.location = location;
          if (demographics) newResponse.demographics = demographics;

          responsesToInsert.push(newResponse);

        } catch (e) {
          skippedRows++;
          errorsInRows.push(`Row ${processedRows}: ${e.message}`);
        }
      })
      .on('end', async () => {
        try {
          if (responsesToInsert.length > 0) {
            await db.collection('responses').insertMany(responsesToInsert, { ordered: false });
            await db.collection('surveys').updateOne(
              { _id: surveyObjectId },
              {
                $inc: { responseCount: responsesToInsert.length },
                $set: { updatedAt: new Date() }
              }
            );
          }
          res.status(200).json({
            status: 'success',
            message: `Bulk upload processed. ${responsesToInsert.length} responses imported. ${skippedRows} rows skipped.`,
            importedCount: responsesToInsert.length,
            skippedCount: skippedRows,
            errors: errorsInRows.length > 0 ? errorsInRows : undefined,
          });
        } catch (dbError) {
          console.error("Error during bulk insert or survey update:", dbError);
          next(new ApiError(500, `Database error during bulk processing: ${dbError.message}`));
        }
      })
      .on('error', (parseError) => {
        console.error("CSV parsing error:", parseError);
        next(new ApiError(400, `Error parsing CSV file: ${parseError.message}`));
      });

  } catch (error) {
    console.error("Error in bulkUploadSurveyResponses controller:", error);
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(500, error.message || 'Failed to process bulk upload.'));
  }
};