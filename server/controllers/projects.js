import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { id: userId, role: userRole } = req.user;

    const db = getDb();

    const newProjectData = {
      name,
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
    const query = {};
    const { id: userId, role: userRole } = req.user;

    if (userRole === 'agent') {
      query.createdBy = new ObjectId(userId);
    }

    const projectsData = await db.collection('projects').find(query).toArray();
    res.json({ status: 'success', data: projectsData });
  } catch (error) {
    console.error("Error in getProjects controller:", error);
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: projectId } = req.params;
    const { id: userId, role: userRole } = req.user;

    if (!ObjectId.isValid(projectId)) {
      throw new ApiError(404, 'Project not found (invalid ID format)');
    }

    const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    if (userRole === 'agent' && project.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to access this project');
    }
    res.json({ status: 'success', data: project });
  } catch (error) {
    console.error("Error in getProjectById controller:", error);
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: projectId } = req.params;
    const { id: userId, role: userRole } = req.user;
    const { name, description } = req.body;

    if (!ObjectId.isValid(projectId)) {
      throw new ApiError(404, 'Project not found (invalid ID format)');
    }

    const existingProject = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (!existingProject) {
      throw new ApiError(404, 'Project not found');
    }

    if (userRole === 'agent' && existingProject.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only update projects you created.');
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ status: 'fail', message: "No valid fields provided for update." });
    }
    updateFields.updatedAt = new Date();

    const result = await db.collection('projects').findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
        throw new ApiError(404, 'Project not found or failed to update');
    }
    res.json({ status: 'success', data: result });
  } catch (error) {
    console.error("Error in updateProject controller:", error);
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const db = getDb();
    const { id: projectId } = req.params;
    const { id: userId, role: userRole } = req.user;

    if (!ObjectId.isValid(projectId)) {
      throw new ApiError(404, 'Project not found (invalid ID format)');
    }

    const existingProject = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (!existingProject) {
      throw new ApiError(404, 'Project not found');
    }

    if (userRole === 'agent' && existingProject.createdBy.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only delete projects you created.');
    }
     if (userRole !== 'admin' && userRole !== 'agent') {
        throw new ApiError(403, 'Forbidden: You are not authorized to delete projects.');
    }

    const result = await db.collection('projects').deleteOne({ _id: new ObjectId(projectId) });

    if (result.deletedCount === 0) {
      throw new ApiError(404, 'Project not found or already deleted');
    }
    res.status(200).json({ status: 'success', message: 'Project deleted successfully' });
  } catch (error) {
    console.error("Error in deleteProject controller:", error);
    next(error);
  }
};
