import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types'; // Assuming Survey type might need question structure later
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input'; // For basic text input
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

// Define a simple question structure for now
interface SurveyQuestion {
  id: string; // Or use index if questions don't have unique IDs from backend yet
  text: string;
  type: 'text' | 'textarea' | 'choice'; // Add more types as needed
  options?: string[]; // For 'choice' type
}

interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
}

const SurveyResponsePage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  useEffect(() => {
    const fetchSurveyDetails = async () => {
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
        // Ensure backend returns survey with _id, map to id. Assume questions are part of surveyData.data
        // For now, if questions are not on surveyData.data, we'll add a mock one.
        const fetchedSurvey = {
            ...(surveyData.data || surveyData),
            id: (surveyData.data || surveyData)._id,
            // MOCK QUESTIONS if not present - REMOVE THIS when backend provides questions
            questions: (surveyData.data || surveyData).questions || [
                { id: 'q1', text: 'What is your overall satisfaction? (Mock)', type: 'text' },
                { id: 'q2', text: 'Any comments? (Mock)', type: 'textarea' }
            ]
        };
        setSurvey(fetchedSurvey);

      } catch (err: any) {
        console.error('Error fetching survey details:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) { // Ensure user context is loaded before trying to fetch
        fetchSurveyDetails();
    } else if (!localStorage.getItem('authToken')) {
        setError("Please login to take the survey.");
        setIsLoading(false);
    }
    // If token exists but user is null, AuthContext is loading, page will show its own loader.
  }, [surveyId, user]);

  const handleInputChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (survey?.status !== 'active') {
      setError("This survey is not currently active and cannot accept responses.");
      return;
    }
    if (Object.keys(responses).length === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError("Authentication required. Please login again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ data: responses }), // Backend expects 'data' field for responseData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `Failed to submit responses: ${response.statusText}`);
      }

      // const submissionResult = await response.json(); // Contains the created response
      setSuccessMessage("Your response has been submitted successfully!");
      // Optionally, disable the form or redirect:
      // navigate(`/surveys/${surveyId}/thankyou`); or set a state to disable form inputs

    } catch (err: any) {
      console.error('Error submitting survey response:', err);
      setError(err.message || 'An unexpected error occurred while submitting your response.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-error-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Survey not found or could not be loaded.</p>
         <Button onClick={() => navigate('/')} className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          {survey.description && <CardDescription>{survey.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Survey ID: {survey.id}</p>
          <p className="text-sm text-gray-500 mb-6">Status: {survey.status}</p>

          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p className="font-bold">Success!</p>
              <p>{successMessage}</p>
            </div>
          )}

          {survey.status !== 'active' && !successMessage && ( // Don't show "not active" if submission was successful
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
              <p className="font-bold">Survey Not Active</p>
              <p>This survey is currently not active and cannot accept responses.</p>
            </div>
          )}

          {survey.status === 'active' && !successMessage && ( // Hide form after successful submission
            <form onSubmit={handleSubmitResponse}>
              <h3 className="text-lg font-semibold mb-4 border-t pt-4">Questions</h3>
              {survey.questions && survey.questions.length > 0 ? (
                survey.questions.map((q, index) => (
                  <div key={q.id || `q-${index}`} className="mb-6">
                    <label htmlFor={q.id || `q-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      {index + 1}. {q.text}
                    </label>
                    {q.type === 'text' && (
                      <Input
                        id={q.id || `q-input-${index}`}
                        value={responses[q.id || `q-${index}`] || ''}
                        onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value)}
                        className="mt-1"
                        disabled={isSubmitting || !!successMessage}
                      />
                    )}
                    {q.type === 'textarea' && (
                       <textarea
                        id={q.id || `q-input-${index}`}
                        value={responses[q.id || `q-${index}`] || ''}
                        onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        disabled={isSubmitting || !!successMessage}
                      />
                    )}
                    {/* Add other question types (e.g., 'choice') here later */}
                  </div>
                ))
              ) : (
                <p>No questions found for this survey.</p>
              )}

              <div className="mt-6 border-t pt-6">
                <Button
                  type="submit"
                  disabled={survey.status !== 'active' || isSubmitting || !!successMessage}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Responses'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyResponsePage;
