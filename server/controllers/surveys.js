import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js'; // Corrected path
import { ObjectId } from 'mongodb';

// Mock database - replace with actual database in production
// let surveys = []; // To be removed
// let responses = []; // To be removed or handled later

export const createSurvey = async (req, res, next) => {
  try {
    const { title, description, questions, status, companyId: bodyCompanyId } = req.body;
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user; // User details from verifyToken

    const db = getDb();

    const newSurveyData = {
      title,
      description: description || '',
      questions: questions || [],
      status: status || 'draft',
      createdBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      responseCount: 0,
    };

    // Handle companyId assignment
    if (userRole === 'admin' && bodyCompanyId && ObjectId.isValid(bodyCompanyId)) {
      newSurveyData.companyId = new ObjectId(bodyCompanyId);
    } else if ((userRole === 'agent' || userRole === 'client') && userCompanyId && ObjectId.isValid(userCompanyId)) {
      // Agents/Clients automatically assigned to their own company if they have one
      // Or if admin is creating for a specific company they can provide bodyCompanyId
      // If agent provides bodyCompanyId, it should ideally match their own or be ignored/validated.
      // For now, admin can override, agent/client uses their own if exists.
      newSurveyData.companyId = new ObjectId(userCompanyId);
      if (bodyCompanyId && bodyCompanyId !== userCompanyId.toString() && userRole !== 'admin') {
        console.warn(`User ${userId} (role: ${userRole}) attempted to set companyId to ${bodyCompanyId} but is associated with ${userCompanyId}. Using user's companyId.`);
      }
    }


    const result = await db.collection('surveys').insertOne(newSurveyData);
    // Fetch the inserted document to return it, as insertOne returns an object with insertedId
    const createdSurvey = await db.collection('surveys').findOne({ _id: result.insertedId });

    res.status(201).json({ status: 'success', data: createdSurvey });
  } catch (error) {
    console.error("Error in createSurvey controller:", error);
    next(error); // Pass to error handling middleware
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    const db = getDb();
    const query = {};
    const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

    if (userRole === 'client') {
      if (!userCompanyId) {
        // Client not associated with a company, should not see any surveys unless specifically shared.
        // For now, returning empty or could be an error.
        return res.json({ status: 'success', data: [] });
      }
      query.companyId = new ObjectId(userCompanyId);
    } else if (userRole === 'agent') {
      // Agents see surveys they created. Optionally, also surveys for their company.
      // For now, only surveys they created.
      query.createdBy = new ObjectId(userId);
    }
    // Admins see all surveys (no additional query filters based on role)

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

    // Authorization checks
    if (userRole === 'client') {
      if (!userCompanyId || !survey.companyId || survey.companyId.toString() !== userCompanyId.toString()) {
        throw new ApiError(403, 'Not authorized to access this survey');
      }
    } else if (userRole === 'agent') {
      // Agent can access their own surveys. Optionally, also surveys for their company.
      // For now, only their own.
      if (survey.createdBy.toString() !== userId.toString()) {
         // Could add a check here: || (survey.companyId && survey.companyId.toString() !== userCompanyId.toString())
         // if agents should also see all surveys from their company.
        throw new ApiError(403, 'Not authorized to access this survey');
      }
    }
    // Admins can access any survey by ID

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
    const { title, description, questions, status, companyId: bodyCompanyId } = req.body;

    if (!ObjectId.isValid(surveyId)) {
      throw new ApiError(404, 'Survey not found (invalid ID format)');
    }

    const existingSurvey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    if (!existingSurvey) {
      throw new ApiError(404, 'Survey not found');
    }

    // Authorization: Admins can edit any survey. Agents can only edit their own.
    if (userRole === 'agent' && existingSurvey.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only update surveys you created.');
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (questions !== undefined) updateFields.questions = questions;
    if (status !== undefined) updateFields.status = status;

    // Handle companyId update - only admins should freely change it.
    // Agents might not be allowed to change it, or only to their own company.
    if (userRole === 'admin' && bodyCompanyId !== undefined) {
        if (bodyCompanyId === null || bodyCompanyId === '') {
            updateFields.companyId = null; // Allow admin to remove companyId
        } else if (ObjectId.isValid(bodyCompanyId)) {
            updateFields.companyId = new ObjectId(bodyCompanyId);
        } else {
            throw new ApiError(400, 'Invalid Company ID format provided for update by admin.');
        }
    } // Agents cannot change companyId directly via this field for now. It's tied to their user profile or initial creation.


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

    // Authorization: Admins can delete any. Agents only their own.
    // The route itself in surveys.js restricts delete to 'admin' currently.
    // If we want agents to delete their own, this logic is correct, but route needs adjustment.
    // Assuming route is adjusted or this controller logic takes precedence for now.
    if (userRole === 'agent' && existingSurvey.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only delete surveys you created.');
    }
     if (userRole !== 'admin' && userRole !== 'agent') { // Double check if non-admin/agent somehow gets here
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

// submitSurveyResponse needs to be refactored for MongoDB as well.
// This will be done in a subsequent step.
export const submitSurveyResponse = async (req, res, next) => {
  try {
    // const survey = surveys.find(s => s.id === req.params.id); // Mock
    const db = getDb();
    const { id: surveyId } = req.params;
     if (!ObjectId.isValid(surveyId)) {
      throw new ApiError(404, 'Survey not found (invalid ID format)');
    }
    const survey = await db.collection('surveys').findOne({ _id: new ObjectId(surveyId) });
    
    if (!survey) {
      throw new ApiError(404, 'Survey not found');
    }

    // TODO: Create a 'responses' collection and insert the response data.
    // For now, logging and returning a placeholder.
    console.log('Received response for survey:', surveyId, 'Data:', req.body.data, 'User:', req.user.id);

    // Example of what inserting a response might look like:
    /*
    const newResponse = {
      surveyId: new ObjectId(surveyId),
      userId: new ObjectId(req.user.id), // Assuming respondent is a logged-in user
      responseData: req.body.data,
      submittedAt: new Date(),
      // location, demographics etc.
    };
    await db.collection('responses').insertOne(newResponse);
    // Potentially update survey's responseCount
    await db.collection('surveys').updateOne({ _id: new ObjectId(surveyId) }, { $inc: { responseCount: 1 } });
    */

    res.status(201).json({ status: 'success', message: 'Response submitted (mock - DB not implemented yet)', data: req.body.data });
  } catch (error) {
    next(error);
  }
};