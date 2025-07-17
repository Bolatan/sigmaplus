import { getDb } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';
import { ObjectId } from 'mongodb';

export const getSurveyStatuses = async (req, res, next) => {
    try {
        const db = getDb();
        const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

        let matchQuery = {};

        if (userRole === 'client') {
            if (!userCompanyId) {
                return res.json({ status: 'success', data: [] });
            }
            matchQuery.companyIds = new ObjectId(userCompanyId);
        } else if (userRole === 'agent') {
            matchQuery.$or = [
                { agentId: new ObjectId(userId) },
                { createdBy: new ObjectId(userId) }
            ];
        }

        const stats = await db.collection('surveys').aggregate([
            { $match: matchQuery },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
        ]).toArray();

        res.json({ status: 'success', data: stats });
    } catch (error) {
        console.error("Error in getSurveyStatuses controller:", error);
        next(new ApiError(500, 'Failed to get survey status statistics.'));
    }
};

export const getResponsesBySurvey = async (req, res, next) => {
    try {
        const db = getDb();
        const { id: userId, role: userRole, companyId: userCompanyId } = req.user;

        let matchQuery = {};

        if (userRole === 'client') {
            if (!userCompanyId) {
                return res.json({ status: 'success', data: [] });
            }
            matchQuery.companyIds = new ObjectId(userCompanyId);
        } else if (userRole === 'agent') {
            matchQuery.$or = [
                { agentId: new ObjectId(userId) },
                { createdBy: new ObjectId(userId) }
            ];
        }

        const stats = await db.collection('surveys').aggregate([
            { $match: matchQuery },
            { $project: { title: 1, responseCount: 1, _id: 0 } }
        ]).toArray();

        res.json({ status: 'success', data: stats });
    } catch (error) {
        console.error("Error in getResponsesBySurvey controller:", error);
        next(new ApiError(500, 'Failed to get responses by survey statistics.'));
    }
};
