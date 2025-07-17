import cron from 'node-cron';
import fetch from 'node-fetch';

const scheduleReportGeneration = () => {
  // Schedule the task to run every day at midnight
  // cron.schedule('0 0 * * *', async () => {
  //   try {
  //     await fetch('http://localhost:3000/api/cron/generate-reports', {
  //       method: 'POST',
  //     });
  //   } catch (error) {
  //     console.error('Failed to trigger report generation:', error);
  //   }
  // });
};

export default scheduleReportGeneration;
