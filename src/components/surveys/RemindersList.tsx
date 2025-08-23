import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';

interface RemindersListProps {
  surveyId: string;
}

const RemindersList: React.FC<RemindersListProps> = ({ surveyId }) => {
  const [reminders, setReminders] = useState([]);
  const api = useApi();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await api.get(`/reminders/${surveyId}`);
        setReminders(response.data.reminders);
      } catch (error) {
        console.error('Failed to fetch reminders', error);
      }
    };

    fetchReminders();
  }, [api, surveyId]);

  return (
    <div className="space-y-4">
      {reminders.map((reminder: any) => (
        <div key={reminder._id} className="p-4 border rounded-md">
          <p><strong>Scheduled At:</strong> {new Date(reminder.scheduledAt).toLocaleString()}</p>
          <p><strong>Subject:</strong> {reminder.subject}</p>
          <p><strong>Status:</strong> {reminder.status}</p>
        </div>
      ))}
    </div>
  );
};

export default RemindersList;
