import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js';

export const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id: userId } = req.user;

    const db = getDb();

    const newProjectData = {
      title,
      description: description || '',
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(newProjectData);
    const createdProject = await db.collection('projects').findOne({ _id: result.insertedId });

    res.status(201).json({ status: 'success', data: createdProject });
  } catch (error) {
    console.error("Error in createProject controller:", error);
    next(error);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const db = getDb();
    const projects = await db.collection('projects').find({}).toArray();
    res.json({ status: 'success', data: projects });
  } catch (error) {
    console.error("Error in getProjects controller:", error);
    next(error);
  }
};
import { ObjectId } from 'mongodb';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const createSurvey = async (req, res, next) => {
  try {
    const { title, description, questions: inputQuestions, status, companyIds: bodyCompanyIds, agentId, customerId, projectId } = req.body;
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

    const db = getDb();

    if (!ObjectId.isValid(projectId)) {
      throw new ApiError(400, 'Invalid Project ID format');
    }

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

      const newQuestion = {
        id: q.id,
        text: q.text.trim(),
        type: q.type,
        options: q.options && Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
        isRequired: typeof q.isRequired === 'boolean' ? q.isRequired : !!q.isRequired,
      };

      if (q.type === 'rating') {
        newQuestion.maxRating = q.maxRating;
      }
      if (q.type === 'file-upload') {
        newQuestion.allowedFileTypes = q.allowedFileTypes;
      }
      if (q.type === 'video') {
        newQuestion.videoUrl = q.videoUrl;
      }
      if (q.type === 'image-choice') {
        newQuestion.options = q.options;
      }

      return newQuestion;
    });

    const newSurveyData = {
      projectId: new ObjectId(projectId),
      title,
      description: description || '',
      questions: validatedQuestions,
      status: status || 'draft',
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      responseCount: 0,
      companyIds: [],
    };

    if (bodyCompanyIds && Array.isArray(bodyCompanyIds) && bodyCompanyIds.every(id => ObjectId.isValid(id))) {
      newSurveyData.companyIds = bodyCompanyIds.map(id => new ObjectId(id));
    } else if (userCompanyId && ObjectId.isValid(userCompanyId)) {
      newSurveyData.companyIds = [new ObjectId(userCompanyId)];
    }

    if (userRole === 'admin' && agentId && ObjectId.isValid(agentId)) {
      newSurveyData.agentId = new ObjectId(agentId);
    }

    if (customerId && ObjectId.isValid(customerId)) {
      newSurveyData.customerId = new ObjectId(customerId);
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
    const { region, demographics, outletType, projectId } = req.query;
    const query = {};
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

    if (projectId) {
      if (!ObjectId.isValid(projectId)) {
        throw new ApiError(400, 'Invalid Project ID format');
      }
      query.projectId = new ObjectId(projectId);
    }

    if (userRole === 'client') {
      if (!userCompanyId) {
        return res.json({ status: 'success', data: [] });
      }
      query.companyIds = new ObjectId(userCompanyId);
    } else if (userRole === 'agent') {
      query.agentId = new ObjectId(userId);
    }

    if (region && region !== 'all') {
      query['location.region'] = region;
    }
    if (demographics && demographics !== 'all') {
      query[`demographics.${demographics}`] = { $exists: true };
    }
    if (outletType && outletType !== 'all') {
      query.outletType = outletType;
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
      if (!userCompanyId || !survey.companyIds || !survey.companyIds.some(id => id.toString() === userCompanyId.toString())) {
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
    const { title, description, questions: inputQuestions, status, companyIds: bodyCompanyIds, agentId, customerId } = req.body;

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


    if (userRole === 'admin' && agentId !== undefined) {
      if (agentId === null || agentId === '') {
        updateFields.agentId = null;
      } else if (ObjectId.isValid(agentId)) {
        updateFields.agentId = new ObjectId(agentId);
      } else {
        throw new ApiError(400, 'Invalid Agent ID format provided for update by admin.');
      }
    }

    if (bodyCompanyIds && Array.isArray(bodyCompanyIds) && bodyCompanyIds.every(id => ObjectId.isValid(id))) {
      updateFields.companyIds = bodyCompanyIds.map(id => new ObjectId(id));
    }

    if (customerId !== undefined) {
      if (customerId === null || customerId === '') {
        updateFields.customerId = null;
      } else if (ObjectId.isValid(customerId)) {
        updateFields.customerId = new ObjectId(customerId);
      } else {
        throw new ApiError(400, 'Invalid Customer ID format provided for update.');
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

    const validatedResponseData = {};
    for (const question of survey.questions) {
      const response = responseData[question.id];
      if (question.isRequired && !response) {
        throw new ApiError(400, `Question "${question.text}" is required.`);
      }

      if (response) {
        switch (question.type) {
          case 'text':
          case 'textarea':
            if (typeof response !== 'string') {
              throw new ApiError(400, `Invalid response type for question "${question.text}". Expected a string.`);
            }
            validatedResponseData[question.id] = response;
            break;
          case 'range':
            const numberResponse = Number(response);
            if (isNaN(numberResponse)) {
              throw new ApiError(400, `Invalid response type for question "${question.text}". Expected a number.`);
            }
            if (question.maxRating && numberResponse > question.maxRating) {
              throw new ApiError(400, `Response for question "${question.text}" exceeds the maximum rating of ${question.maxRating}.`);
            }
            validatedResponseData[question.id] = numberResponse;
            break;
          default:
            validatedResponseData[question.id] = response;
        }
      }
    }

    const newResponse = {
      surveyId: surveyObjectId,
      userId: new ObjectId(userId),
      responseData: validatedResponseData,
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

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded.');
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ status: 'success', data: { url: fileUrl } });
  } catch (error) {
    console.error("Error in uploadFile controller:", error);
    next(error);
  }
};