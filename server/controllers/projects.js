import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

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

export const getProjectById = async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const project = await db.collection('projects').findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
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