import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Survey, Question } from '../types/survey';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { SurveyService } from '../../services/SurveyService';

const SurveyResponsePage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveyDetails = async () => {
      if (!surveyId) {
        setError('Survey ID not found in URL.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const fetchedSurvey = await SurveyService.getById(surveyId);
        if (fetchedSurvey) {
          setSurvey(fetchedSurvey);
        } else {
          setError('Survey not found.');
        }
      } catch (err: any) {
        console.error('Error fetching survey details:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyDetails();
  }, [surveyId]);

  const handleInputChange = (questionId: string, value: string, questionType: Question['type']) => {
    setResponses((prev) => {
      const newResponses = { ...prev };
      if (questionType === 'multiple-choice') {
        const currentAnswers = (newResponses[questionId] || []) as string[];
        if (currentAnswers.includes(value)) {
          newResponses[questionId] = currentAnswers.filter((ans) => ans !== value);
        } else {
          newResponses[questionId] = [...currentAnswers, value];
        }
      } else {
        newResponses[questionId] = value;
      }
      return newResponses;
    });
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(responses).length === 0) {
      setError('Please answer at least one question before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Authentication required. Please login again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: responses }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.msg || errorData.error || `Failed to submit responses: ${response.statusText}`
        );
      }

      setSuccessMessage('Your response has been submitted successfully!');
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
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Survey not found or could not be loaded.</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go to Dashboard
        </Button>
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
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
              <p className="font-bold">Success!</p>
              <p>{successMessage}</p>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmitResponse}>
              <h3 className="text-lg font-semibold mb-4 border-t pt-4">Questions</h3>
              {survey.questions && survey.questions.length > 0 ? (
                survey.questions.map((q, index) => (
                  <div key={q.id} className="mb-6">
                    <label htmlFor={q.id} className="block text-sm font-medium text-gray-700 mb-1">
                      {index + 1}. {q.text}
                    </label>
                    {q.type === 'text' && (
                      <Input
                        id={q.id}
                        value={(responses[q.id] as string) || ''}
                        onChange={(e) => handleInputChange(q.id, e.target.value, q.type)}
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    )}
                    {q.type === 'multiple-choice' && q.options && q.options.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {q.options.map((option, optIndex) => (
                          <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name={`${q.id}-${optIndex}`}
                              value={option.id}
                              checked={((responses[q.id] || []) as string[]).includes(option.id)}
                              onChange={(e) => handleInputChange(q.id, e.target.value, q.type)}
                              className="rounded text-primary-600 focus:ring-primary-500"
                              disabled={isSubmitting}
                            />
                            <span>{option.text}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'matrix' && <div>Matrix Options</div>}
                    {q.type === 'star-rating' && <div>Star Rating</div>}
                    {q.type === 'ranking' && <div>Ranking Options</div>}
                  </div>
                ))
              ) : (
                <p>No questions found for this survey.</p>
              )}

              <div className="mt-6 border-t pt-6">
                <Button type="submit" disabled={isSubmitting} className="w-full">
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
