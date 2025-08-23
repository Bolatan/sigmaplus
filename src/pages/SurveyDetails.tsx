import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Survey } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import RemindersList from '../components/surveys/RemindersList';

const SurveyDetailsPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await api.get(`/surveys/${surveyId}`);
        setSurvey(response.data);
      } catch (err) {
        setError('Failed to fetch survey details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [api, surveyId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await api.put(`/surveys/${surveyId}`, { status: newStatus });
      setSurvey(response.data);
    } catch (err) {
      setError('Failed to update survey status.');
    }
  };

  const [activeTab, setActiveTab] = useState('details');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!survey) return <div>Survey not found.</div>;

  const surveyUrl = `${window.location.origin}/surveys/${surveyId}/respond`;
  const pilotSurveyUrl = `${window.location.origin}/surveys/${surveyId}/respond?pilot=true`;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          <CardDescription>{survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('details')}
                className={`${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('distribute')}
                className={`${
                  activeTab === 'distribute'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Distribute
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`${
                  activeTab === 'reminders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Automated Reminders
              </button>
            </nav>
          </div>
          <div className="mt-8">
            {activeTab === 'details' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Status</h3>
                  <select
                    value={survey.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="pilot">Pilot</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="mt-6">
                  <Link to={`/surveys/${surveyId}/edit`}>
                    <Button>Edit Survey</Button>
                  </Link>
                </div>
              </div>
            )}
            {activeTab === 'distribute' && (
              <div>
                <h3 className="text-lg font-semibold">Share your survey</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Public URL</label>
                    <div className="flex items-center space-x-2">
                      <input type="text" readOnly value={surveyUrl} className="input w-full" />
                      <Button onClick={() => navigator.clipboard.writeText(surveyUrl)}>Copy</Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pilot URL</label>
                    <div className="flex items-center space-x-2">
                      <input type="text" readOnly value={pilotSurveyUrl} className="input w-full" />
                      <Button onClick={() => navigator.clipboard.writeText(pilotSurveyUrl)}>Copy</Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-semibold">Share on social media</h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(surveyUrl)}&text=${encodeURIComponent(survey.title)}`} target="_blank" rel="noopener noreferrer">
                        <Button>Twitter</Button>
                      </a>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(surveyUrl)}`} target="_blank" rel="noopener noreferrer">
                        <Button>Facebook</Button>
                      </a>
                      <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(surveyUrl)}&title=${encodeURIComponent(survey.title)}&summary=${encodeURIComponent(survey.description)}`} target="_blank" rel="noopener noreferrer">
                        <Button>LinkedIn</Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reminders' && (
              <div>
                <h3 className="text-lg font-semibold">Schedule a new reminder</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as typeof e.target & {
                      scheduledAt: { value: string };
                      subject: { value: string };
                      body: { value: string };
                    };
                    await api.post('/reminders', {
                      surveyId,
                      scheduledAt: target.scheduledAt.value,
                      subject: target.subject.value,
                      body: target.body.value,
                    });
                    // Refresh reminders list
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Scheduled At</label>
                      <input type="datetime-local" name="scheduledAt" className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject</label>
                      <input type="text" name="subject" className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Body</label>
                      <textarea name="body" className="input" />
                    </div>
                    <div>
                      <Button type="submit">Schedule Reminder</Button>
                    </div>
                  </div>
                </form>
                <h3 className="text-lg font-semibold mt-8">Existing reminders</h3>
                {/* Add list of existing reminders here */}
                <RemindersList surveyId={surveyId} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDetailsPage;
