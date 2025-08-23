import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { ApiError } from '../utils/ApiError.js';

const defaultPreferences = {
  layoutOrder: ['stats', 'surveys', 'chart'],
  customHeaders: {
    title: 'Title',
    status: 'Status',
    responses: 'Responses',
  },
  annotations: [],
};

// @desc    Get user's dashboard preferences
// @route   GET /api/dashboard/preferences
// @access  Private
export const getDashboardPreferences = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: userId } = req.user;

    const preferences = await db.collection('dashboard_preferences').findOne({ userId: new ObjectId(userId) });

    if (preferences) {
      // Remove _id from the returned object for cleaner state management on frontend
      const { _id, ...prefs } = preferences;
      res.json({ status: 'success', data: prefs });
    } else {
      res.json({ status: 'success', data: { ...defaultPreferences, userId: new ObjectId(userId) } });
    }
  } catch (err) {
    console.error('Error fetching dashboard preferences:', err);
    next(new ApiError(500, 'Failed to fetch dashboard preferences.'));
  }
};

// @desc    Update or create user's dashboard preferences
// @route   POST /api/dashboard/preferences
// @access  Private
export const updateDashboardPreferences = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: userId } = req.user;
    const { layoutOrder, customHeaders, annotations } = req.body;

    const updateFields = {};
    if (layoutOrder) updateFields.layoutOrder = layoutOrder;
    if (customHeaders) updateFields.customHeaders = customHeaders;
    if (annotations) updateFields.annotations = annotations;

    if (Object.keys(updateFields).length === 0) {
      return next(new ApiError(400, 'No preference data provided.'));
    }

    updateFields.updatedAt = new Date();

    const result = await db.collection('dashboard_preferences').findOneAndUpdate(
      { userId: new ObjectId(userId) },
      {
        $set: updateFields,
        $setOnInsert: { userId: new ObjectId(userId), createdAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Error updating dashboard preferences:', err);
    next(new ApiError(500, 'Failed to update dashboard preferences.'));
  }
};
