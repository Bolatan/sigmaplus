import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { ApiError } from '../utils/ApiError.js'; // Assuming you have this

export const updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { name, role, companyId, status } = req.body;

  try {
    const db = getDb();
    const updateFields = {};

    if (name !== undefined) updateFields.name = String(name).trim();
    if (role !== undefined) updateFields.role = role; // Validation for specific roles is in the route
    if (status !== undefined) updateFields.status = status; // Validation for 'active'/'inactive' is in the route

    if (companyId !== undefined) {
      if (companyId === null || companyId === '') {
        // To remove companyId, we need to use $unset, or ensure it's set to null if schema allows
        updateFields.companyId = null;
      } else if (ObjectId.isValid(companyId)) {
        updateFields.companyId = new ObjectId(companyId);
      } else {
        // This case should ideally be caught by route validation isMongoId()
        // but as a safeguard if checkFalsy was tricky for validator.
        return next(new ApiError(400, 'Invalid Company ID format provided for update.'));
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ errors: [{ msg: 'No valid fields provided for update.' }] });
    }
    updateFields.updatedAt = new Date();

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: 'after', projection: { password: 0 } } // Exclude password from result
    );

    if (!result) {
      return next(new ApiError(404, 'User not found.'));
    }

    res.json({ status: 'success', data: result });

  } catch (err) {
    console.error(`Error in updateUser controller for userId ${userId}:`, err);
    if (err instanceof ApiError) return next(err); // Forward known API errors
    return next(new ApiError(500, err.message || 'Server error while updating user.'));
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const db = getDb();
    // Exclude passwords from the result
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.json({ data: users });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    next(new ApiError(500, "Failed to fetch users from database"));
  }
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (!ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid user ID format"));
    }
    // Exclude password from the result
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    res.json({ data: user });
  } catch (err) {
    console.error("Failed to fetch user:", err);
    next(new ApiError(500, "Failed to fetch user from database"));
  }
};

// Placeholder for deleteUser if needed later
export const deleteUser = async (req, res, next) => {
    // Logic for deleting a user (hard or soft delete)
    // Ensure proper authorization
    return next(new ApiError(501, 'Delete user not implemented yet.'));
};
