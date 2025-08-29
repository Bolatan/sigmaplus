import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

export const createProject = async (req, res, next) => {
  try {
    const { title, description, assignedAgents } = req.body;
    const { id: userId, companyId, role } = req.user;

    const db = getDb();

    const newProjectData = {
      title,
      description: description || '',
      createdBy: new ObjectId(userId),
      companyId: new ObjectId(companyId),
      assignedAgents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (role === 'admin' && assignedAgents && Array.isArray(assignedAgents)) {
      newProjectData.assignedAgents = assignedAgents.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    } else {
      newProjectData.assignedAgents = [new ObjectId(userId)];
    }

    const result = await db.collection('projects').insertOne(newProjectData);
    const createdProject = await db.collection('projects').findOne({ _id: result.insertedId });

    res.status(201).json({ status: 'success', data: createdProject });
  } catch (error) {
    console.error("Error in createProject controller:", error);
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignedAgents } = req.body;
    const { role } = req.user;
    const db = getDb();

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const updateFields = { updatedAt: new Date() };
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    if (role === 'admin' && assignedAgents && Array.isArray(assignedAgents)) {
      updateFields.assignedAgents = assignedAgents.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    }

    const updatedResult = await db.collection('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (updatedResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await db.collection('projects').findOne({ _id: new ObjectId(id) });

    res.json({ status: 'success', data: updatedProject });
  } catch (err) {
    console.error(`Failed to update project ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req, res, next) => {
  console.log('deleteProject: Received request');
  try {
    const db = getDb();
    const { id } = req.params;
    console.log('deleteProject: Project ID:', id);

    if (!ObjectId.isValid(id)) {
      console.log('deleteProject: Invalid project ID format');
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const projectObjectId = new ObjectId(id);

    // First, delete all surveys associated with this project
    const deleteSurveysResult = await db.collection('surveys').deleteMany({ projectId: projectObjectId });
    console.log(`deleteProject: Deleted ${deleteSurveysResult.deletedCount} surveys`);

    // Then, delete the project itself
    const result = await db.collection('projects').deleteOne({ _id: projectObjectId });

    if (result.deletedCount === 0) {
      console.log('deleteProject: Project not found');
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('deleteProject: Project and associated surveys deleted successfully');
    res.status(200).json({ status: 'success', message: 'Project and associated surveys deleted successfully' });
  } catch (err) {
    console.error(`Failed to delete project ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const db = getDb();
    const { companyId, id: userId, role } = req.user;
    let query = { companyId: new ObjectId(companyId) };

    if (role === 'agent') {
      query.assignedAgents = new ObjectId(userId);
    }

    const projects = await db.collection('projects').find(query).toArray();
    res.json({ status: 'success', data: projects });
  } catch (error) {
    console.error("Error in getProjects controller:", error);
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { companyId, id: userId, role } = req.user;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const project = await db.collection('projects').findOne({ _id: new ObjectId(id), companyId: new ObjectId(companyId) });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (role === 'agent' && !project.assignedAgents.some(agentId => agentId.equals(userId))) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    res.json({ data: project });
  } catch (err) {
    console.error(`Failed to fetch project ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch project' });
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