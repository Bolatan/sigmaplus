import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { ApiError } from '../utils/ApiError.js';
import argon2 from 'argon2';

export const updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { name, role: newRole, companyId: newCompanyId, status } = req.body;

  try {
    const db = getDb();
    const userObjectId = new ObjectId(userId);

    // Fetch the current user to check their existing role if role is not being updated
    const currentUser = await db.collection('users').findOne({ _id: userObjectId });
    if (!currentUser) {
      return next(new ApiError(404, 'User not found.'));
    }

    const effectiveRole = newRole || currentUser.role;

    // Validate companyId based on effectiveRole
    if (effectiveRole === 'client') {
      if (newCompanyId === null || newCompanyId === '' || !ObjectId.isValid(newCompanyId)) {
        return next(new ApiError(400, `A valid Company ID is required for the 'client' role.`));
      }
    }
    // For 'agent' or 'admin', companyId is optional. If provided invalidly, route validation catches it.
    // If an agent is having their companyId removed, that's allowed by this controller logic.

    const updateFields = {}; // Removed `: any` type annotation
    if (name !== undefined) updateFields.name = String(name).trim();
    if (newRole !== undefined) updateFields.role = newRole;
    if (status !== undefined) updateFields.status = status;

    // Handle companyId specifically based on new rules
    if (newCompanyId !== undefined) { // If companyId is part of the request
      if (newCompanyId === null || newCompanyId === '') {
        // Allow unsetting companyId for admin or agent
        if (effectiveRole === 'admin' || effectiveRole === 'agent') {
          updateFields.companyId = null;
        } else { // This is a 'client' role trying to unset, which should be blocked
          return next(new ApiError(400, `Clients must have a Company ID. To remove, change role first.`));
        }
      } else if (ObjectId.isValid(newCompanyId)) { // If it's a valid ID string
        updateFields.companyId = new ObjectId(newCompanyId);
      } else {
        // Invalid format if provided, should have been caught by route validation but as a safeguard
        return next(new ApiError(400, 'Invalid Company ID format.'));
      }
    } else if (newRole === 'client' && !currentUser.companyId) {
      // If role is changing to 'client' and no newCompanyId is provided,
      // and current user doesn't have one, this is an error.
      // (Route validation should catch if newCompanyId is missing when role is client).
      return next(new ApiError(400, `Company ID is required when setting role to 'client'.`));
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ errors: [{ msg: 'No valid fields provided for update.' }] });
    }
    updateFields.updatedAt = new Date();

    const result = await db.collection('users').findOneAndUpdate(
      { _id: userObjectId },
      { $set: updateFields },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    // findOneAndUpdate returns the document *before* update by default if returnDocument isn't 'after'
    // or if the document didn't match. The check for !result (or !result.value in older driver versions) is key.
    if (!result) { // This means the document was not found
      return next(new ApiError(404, 'User not found during update.'));
    }

    res.json({ status: 'success', data: result }); // result is already the updated document

  } catch (err) {
    console.error(`Error in updateUser controller for userId ${userId}:`, err);
    if (err instanceof ApiError) return next(err); // Forward known API errors
    return next(new ApiError(500, err.message || 'Server error while updating user.'));
  }
};

export const setUserPasswordByAdmin = async (req, res, next) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!ObjectId.isValid(userId)) {
    return next(new ApiError(400, "Invalid user ID format."));
  }

  // Password validation (length) is handled by express-validator in the route
  // Additional complexity checks could be added here if desired.

  try {
    const db = getDb();

    const hashedPassword = await argon2.hash(newPassword);

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return next(new ApiError(404, 'User not found.'));
    }
    if (result.modifiedCount === 0 && result.matchedCount === 1) {
      // This could happen if the new password hash is identical to the old one,
      // or if only updatedAt was effectively changed. Still, consider it a success.
      console.log(`User password for ${userId} was set, but modifiedCount is 0. Matched count: ${result.matchedCount}`);
    }

    res.status(200).json({ status: 'success', message: 'User password updated successfully.' });

  } catch (err) {
    console.error(`Error in setUserPasswordByAdmin for userId ${userId}:`, err);
    // Avoid leaking bcrypt specific errors if any, though unlikely here
    return next(new ApiError(500, err.message || 'Server error while updating password.'));
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

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (!ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid user ID format"));
    }
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return next(new ApiError(404, 'User not found or already deleted.'));
    }
    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (err) {
    console.error(`Error in deleteUser controller for userId ${id}:`, err);
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(500, err.message || 'Server error while deleting user.'));
  }
};
