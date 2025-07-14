import { ApiError } from '../utils/ApiError.js';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import csv from 'csv-parser';
import { Readable } from 'stream';

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