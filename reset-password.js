import { connectToServer, getDb } from './server/utils/db.js';
import { ObjectId } from 'mongodb';
import argon2 from 'argon2';

const newPassword = 'password123';
const userId = '68adb4fdb7735fe0e14c4556';

async function resetPassword() {
  try {
    console.log('Connecting to the database...');
    await connectToServer();
    const db = getDb();
    console.log('Database connected.');

    console.log(`Hashing the new password: ${newPassword}`);
    const hashedPassword = await argon2.hash(newPassword);
    console.log('Password hashed.');

    const userObjectId = new ObjectId(userId);

    console.log(`Updating password for user ID: ${userId}`);
    const result = await db.collection('users').updateOne(
      { _id: userObjectId },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      console.error('Error: User not found.');
    } else if (result.modifiedCount === 0) {
      console.warn('Warning: Password was not modified. It might be the same as the old one.');
    } else {
      console.log('Password has been reset successfully.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to reset password:', err);
    process.exit(1);
  }
}

resetPassword();
