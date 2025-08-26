import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const createSurvey = async (req, res, next) => {
  console.log('createSurvey: Received request');
  try {
    const { title, description, questions: inputQuestions, status, companyIds, agentId, customerId, projectId, headTeacherName, contactNumber, type } = req.body;
    console.log('createSurvey: Request body:', req.body);
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;
    console.log('createSurvey: User:', req.user);

    const db = getDb();

    if (!projectId || !ObjectId.isValid(projectId)) {
      console.log('createSurvey: Invalid projectId');
      throw new ApiError(400, 'A valid project ID is required.');
    }

    const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      console.log('createSurvey: Project not found');
      throw new ApiError(404, 'Project not found.');
    }

    const validatedQuestions = (inputQuestions || []).map((q, index) => {
      const newQuestion = {
        ...q,
        id: q.id || new ObjectId().toString(),
      };

      if (q.logic) {
        // Basic validation for logic
        if (typeof q.logic !== 'object' || !q.logic.conditions || !Array.isArray(q.logic.conditions)) {
          throw new ApiError(400, `Question at index ${index} has invalid logic structure.`);
        }
        newQuestion.logic = q.logic;
      }

      return newQuestion;
    });

    const newSurveyData = {
      title,
      description: description || '',
      type: type || 'descriptive',
      questions: validatedQuestions,
      status: 'active', // Always set status to active
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      responseCount: 0,
      companyIds: [],
      projectId: new ObjectId(projectId),
      headTeacherName: headTeacherName || '',
      contactNumber: contactNumber || '',
    };
    console.log('createSurvey: New survey data:', newSurveyData);

    if (userRole === 'admin' && companyIds && Array.isArray(companyIds)) {
      newSurveyData.companyIds = companyIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    } else if (userRole === 'agent' && userCompanyId && ObjectId.isValid(userCompanyId)) {
      newSurveyData.companyIds = [new ObjectId(userCompanyId)];
    }

    if (userRole === 'admin' && agentId && ObjectId.isValid(agentId)) {
      newSurveyData.agentId = new ObjectId(agentId);
    } else if (userRole === 'agent') {
      newSurveyData.agentId = new ObjectId(userId);
    }

    if (customerId && ObjectId.isValid(customerId)) {
      newSurveyData.customerId = new ObjectId(customerId);
    }

    const result = await db.collection('surveys').insertOne(newSurveyData);
    const createdSurvey = await db.collection('surveys').findOne({ _id: result.insertedId });
    console.log('createSurvey: Survey created successfully:', createdSurvey);

    res.status(201).json({ status: 'success', data: createdSurvey });
  } catch (error) {
    console.error("Error in createSurvey controller:", error);
    next(error);
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    const db = getDb();
    const { region, demographics, outletType, timePeriod, projectId } = req.query;
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

    // Base query for surveys, includes authorization and project filtering
    const surveyFilter = {};
    if (userRole === 'client') {
      if (!userCompanyId) {
        return res.json({ status: 'success', data: [] });
      }
      surveyFilter.companyIds = new ObjectId(userCompanyId);
    } else if (userRole === 'agent') {
      surveyFilter.$or = [
        { agentId: new ObjectId(userId) },
        { createdBy: new ObjectId(userId) }
      ];
    }
    if (projectId && ObjectId.isValid(projectId)) {
      surveyFilter.projectId = new ObjectId(projectId);
    }

    const hasDataFilters = (region && region !== 'all') ||
                           (demographics && demographics !== 'all') ||
                           (outletType && outletType !== 'all') ||
                           (timePeriod && timePeriod !== 'all');

    if (!hasDataFilters) {
      // Original behavior: no response-based filters, just fetch surveys
      const surveysData = await db.collection('surveys').find(surveyFilter).toArray();
      return res.json({ status: 'success', data: surveysData });
    }

    // New behavior: filter based on responses
    const responseMatch = {};
    if (region && region !== 'all') {
      // WARNING: This assumes the 'region' sent from the frontend (e.g., 'North')
      // directly matches a 'region' field in the 'location' object of a response.
      // The current data structure seems to have 'state' (e.g., 'NY'), not 'region'.
      // This will require a data mapping or a frontend change to work correctly.
      responseMatch['location.region'] = region;
    }
    if (outletType && outletType !== 'all') {
        responseMatch.outletType = outletType;
    }
    if (demographics && demographics !== 'all') {
        // WARNING: This only checks for the existence of a demographic key (e.g., 'age'),
        // not its value. The frontend needs to be updated to support value-based filtering.
        responseMatch[`demographics.${demographics}`] = { $exists: true };
    }
    if (timePeriod && timePeriod !== 'all') {
        const now = new Date();
        let startDate;
        // The values match what's in ClientDashboard.tsx
        if (timePeriod === 'Last 30 Days') {
            startDate = new Date(new Date().setDate(now.getDate() - 30));
        } else if (timePeriod === 'Last 90 Days') {
            startDate = new Date(new Date().setDate(now.getDate() - 90));
        } else if (timePeriod === 'Last Year') {
            startDate = new Date(new Date().setFullYear(now.getFullYear() - 1));
        }
        if (startDate) {
            responseMatch.submittedAt = { $gte: startDate };
        }
    }

    if (Object.keys(responseMatch).length === 0) {
        const surveysData = await db.collection('surveys').find(surveyFilter).toArray();
        return res.json({ status: 'success', data: surveysData });
    }

    // Aggregation pipeline to find survey IDs that have matching responses
    const pipeline = [
      { $match: responseMatch },
      { $group: { _id: '$surveyId' } },
    ];

    const responseCollection = db.collection('responses');
    const matchingAgg = await responseCollection.aggregate(pipeline).toArray();
    const surveyIds = matchingAgg.map(item => item._id);

    if (surveyIds.length === 0) {
      return res.json({ status: 'success', data: [] });
    }

    // Add the filtered survey IDs to the main survey query
    surveyFilter._id = { $in: surveyIds };

    const surveysData = await db.collection('surveys').find(surveyFilter).toArray();
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
      return next(new ApiError(404, 'Survey not found (invalid ID format)'));
    }

    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });

    if (!survey) {
      return next(new ApiError(404, 'Survey not found'));
    }

    if (userRole === 'admin') {
      // Admin can access any survey, so no further checks.
    } else if (userRole === 'client') {
      if (!userCompanyId || !survey.companyIds || !survey.companyIds.some(id => id.toString() === userCompanyId.toString())) {
        return next(new ApiError(403, 'Not authorized to access this survey'));
      }
    } else if (userRole === 'agent') {
      const isCreator = survey.createdBy.toString() === userId.toString();
      const isAgent = survey.agentId && survey.agentId.toString() === userId.toString();
      if (!isCreator && !isAgent) {
        return next(new ApiError(403, 'Not authorized to access this survey'));
      }
    }
    res.json({ status: 'success', data: survey });
  } catch (error) {
    console.error("Error in getSurveyById controller:", error);
    next(new ApiError(500, 'An unexpected error occurred while fetching the survey.'));
  }
};

export const updateSurvey = async (req, res, next) => {
  console.log('updateSurvey: Received request');
  try {
    const db = getDb();
    const { id: surveyId } = req.params;
    console.log('updateSurvey: Survey ID:', surveyId);
    const { id: userId, role: userRole } = req.user;
    console.log('updateSurvey: User:', req.user);
    const { title, description, questions: inputQuestions, status, companyId: bodyCompanyId, agentId, customerId, projectId, headTeacherName, contactNumber } = req.body;
    console.log('updateSurvey: Request body:', req.body);

    if (!ObjectId.isValid(surveyId)) {
      console.log('updateSurvey: Invalid survey ID format');
      throw new ApiError(404, 'Survey not found (invalid ID format)');
    }

    const existingSurvey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    if (!existingSurvey) {
      console.log('updateSurvey: Survey not found');
      throw new ApiError(404, 'Survey not found');
    }

    if (userRole !== 'admin' && userRole !== 'agent') {
      console.log('updateSurvey: User not authorized');
      throw new ApiError(403, 'Forbidden: You are not authorized to edit surveys.');
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (status !== undefined) updateFields.status = status;
    if (headTeacherName !== undefined) updateFields.headTeacherName = headTeacherName.trim();
    if (contactNumber !== undefined) updateFields.contactNumber = contactNumber.trim();

    if (projectId !== undefined) {
      if (!ObjectId.isValid(projectId)) {
        throw new ApiError(400, 'Invalid Project ID format.');
      }
      const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
      if (!project) {
        throw new ApiError(404, 'Project not found.');
      }
      updateFields.projectId = new ObjectId(projectId);
    }

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

        if (q.logic) {
          if (typeof q.logic !== 'object' || !q.logic.conditions || !Array.isArray(q.logic.conditions)) {
            throw new ApiError(400, `Update: Question '${q.id}' (index ${index}) has invalid logic structure.`);
          }
          updatedQuestion.logic = q.logic;
        }

        return updatedQuestion;
      });
    }

    if ((userRole === 'admin' || userRole === 'agent') && req.body.companyIds !== undefined) {
      if (Array.isArray(req.body.companyIds)) {
        updateFields.companyIds = req.body.companyIds
          .filter(id => ObjectId.isValid(id))
          .map(id => new ObjectId(id));
      } else {
        throw new ApiError(400, 'companyIds must be an array.');
      }
    }

    if ((userRole === 'admin' || userRole === 'agent') && agentId !== undefined) {
      if (agentId === null || agentId === '') {
        updateFields.agentId = null;
      } else if (ObjectId.isValid(agentId)) {
        updateFields.agentId = new ObjectId(agentId);
      } else {
        throw new ApiError(400, 'Invalid Agent ID format provided for update by admin.');
      }
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
    console.log('updateSurvey: Update fields:', updateFields);

    const result = await db.collection('surveys').findOneAndUpdate(
      { _id: new ObjectId(surveyId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
        console.log('updateSurvey: Survey not found or failed to update');
        throw new ApiError(404, 'Survey not found or failed to update');
    }
    console.log('updateSurvey: Survey updated successfully:', result);
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error("Error in updateSurvey controller:", error);
    next(error);
  }
};

export const deleteSurvey = async (req, res, next) => {
  console.log('deleteSurvey: Received request');
  try {
    const db = getDb();
    const { id: surveyId } = req.params;
    console.log('deleteSurvey: Survey ID:', surveyId);
    const { id: userId, role: userRole } = req.user;
    console.log('deleteSurvey: User:', req.user);

    if (!ObjectId.isValid(surveyId)) {
      console.log('deleteSurvey: Invalid survey ID format');
      throw new ApiError(404, 'Survey not found (invalid ID format)');
    }

    const existingSurvey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    if (!existingSurvey) {
      console.log('deleteSurvey: Survey not found');
      throw new ApiError(404, 'Survey not found');
    }

    if (userRole !== 'admin' && userRole !== 'agent') {
      console.log('deleteSurvey: User not authorized');
      throw new ApiError(403, 'Forbidden: You are not authorized to delete surveys.');
    }

    const result = await db.collection('surveys').deleteOne({ _id: new ObjectId(surveyId) });

    if (result.deletedCount === 0) {
      console.log('deleteSurvey: Survey not found or already deleted');
      throw new ApiError(404, 'Survey not found or already deleted');
    }
    console.log('deleteSurvey: Survey deleted successfully');
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
