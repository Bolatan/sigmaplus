import cron from 'node-cron';
import { getDb } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const sendReminderEmail = (to, subject, body) => {
  // In a real application, this would use a proper email sending service like SendGrid or Nodemailer
  console.log(`Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
};

const checkAndSendReminders = async () => {
  console.log('Running reminder check...');
  const db = getDb();
  const now = new Date();

  const reminders = await db.collection('reminders').find({
    status: 'scheduled',
    scheduledAt: { $lte: now },
  }).toArray();

  for (const reminder of reminders) {
    const survey = await db.collection('surveys').findOne({ _id: reminder.surveyId });
    if (!survey) continue;

    const responses = await db.collection('responses').find({ surveyId: reminder.surveyId }).toArray();
    const respondents = responses.map(r => r.userId.toString());

    // This is a simplified example. In a real application, you would have a list of all potential respondents
    // and you would filter out those who have already responded.
    // For now, we will just log a message.
    console.log(`Sending reminders for survey: ${survey.title}`);
    console.log(`Non-respondents would be emailed here.`);


    await db.collection('reminders').updateOne(
      { _id: reminder._id },
      { $set: { status: 'sent' } }
    );
  }
};

export const scheduleReminderJobs = () => {
  // Schedule to run every minute for demonstration
  cron.schedule('* * * * *', checkAndSendReminders);
};
