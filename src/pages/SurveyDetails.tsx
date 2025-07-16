import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const SurveyDetails: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveyDetails = useCallback(async () => {
    if (!surveyId) {
      setError("Survey ID not found in URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError("Authentication required. Please login.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `Failed to fetch survey details: ${response.statusText}`);
      }

      const surveyData = await response.json();
      const surveyFromApi = surveyData.data || surveyData;

      if (!surveyFromApi || !surveyFromApi._id) {
          throw new Error("Fetched survey data is invalid or missing ID.");
      }

      const fetchedSurvey: Survey = {
          ...surveyFromApi,
          id: surveyFromApi._id, // Map _id to id
          questions: surveyFromApi.questions || [] // Ensure questions is an array, even if empty from backend
      };
      setSurvey(fetchedSurvey);

    } catch (err: any) {
      console.error('Error fetching survey details:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    if (user) { // Ensure user context is loaded before trying to fetch
        fetchSurveyDetails();
    } else if (!localStorage.getItem('authToken')) {
        setError("Please login to take the survey.");
        setIsLoading(false);
    }
    // If token exists but user is null, AuthContext is loading, page will show its own loader.
  }, [surveyId, user, fetchSurveyDetails]);

  const handleDelete = useCallback(async (surveyId: string) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) {
      return;
    }

    setError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Authentication required. Please login.");
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `Failed to delete survey: ${response.statusText}`);
      }

      navigate('/surveys');
    } catch (err: any) {
      console.error('Error deleting survey:', err);
      setError(err.message || 'An unexpected error occurred.');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error
        </h3>
        <p className="text-gray-500">
          {error}
        </p>

      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Survey not found
        </h3>

      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{survey.title}</CardTitle>
            <div className="flex space-x-2">
              {(user?.role === 'admin' || user?.role === 'agent') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/surveys/${survey.id}/respond`)}
              >
                Take Survey
              </Button>
              {(user?.role === 'admin' || user?.role === 'agent') && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(survey.id)}
                >
                  Delete
                </Button>
              )}
               <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/projects')}
                >
                Create Survey
                </Button>
            </div>
          </div>
          {survey.description && <CardDescription>{survey.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Survey ID: {survey.id}</p>
          <p className="text-sm text-gray-500 mb-6">Status: {survey.status}</p>

          <h3 className="text-lg font-semibold mb-4 border-t pt-4">Questions</h3>
          {survey.questions && survey.questions.length > 0 ? (
            survey.questions.map((q, index) => (
              <div key={q.id || `q-${index}`} className="mb-6">
                <label htmlFor={q.id || `q-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {index + 1}. {q.text}
                </label>
                <p className="text-sm text-gray-500">Type: {q.type}</p>
                {q.options && q.options.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {q.options.map((option, optIndex) => (
                      <p key={optIndex} className="text-sm text-gray-500 pl-4">{option}</p>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No questions found for this survey.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDetails;
