import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types'; // Assuming Survey type might need question structure later
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input'; // For basic text input
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

import { QuestionType } from '../types';

// Define a simple question structure for now
interface SurveyQuestion {
  id: string; // Or use index if questions don't have unique IDs from backend yet
  text: string;
  type: QuestionType; // Add more types as needed
  options?: string[]; // For 'choice' type
  isRequired?: boolean;
  maxRating?: number;
  allowedFileTypes?: string;
  videoUrl?: string;
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
  const [responses, setResponses] = useState<Record<string, string | string[]>>({}); // Allow string array for multi-choice
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
        const surveyFromApi = surveyData.data || surveyData;

        if (!surveyFromApi || !surveyFromApi._id) {
            throw new Error("Fetched survey data is invalid or missing ID.");
        }

        const fetchedSurvey = {
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
    };

    if (user) { // Ensure user context is loaded before trying to fetch
        fetchSurveyDetails();
    } else if (!localStorage.getItem('authToken')) {
        setError("Please login to take the survey.");
        setIsLoading(false);
    }
    // If token exists but user is null, AuthContext is loading, page will show its own loader.
  }, [surveyId, user]);

  const handleFileUpload = async (questionId: string, file: File) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/surveys/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `Failed to upload file: ${response.statusText}`);
      }

      const result = await response.json();
      const fileUrl = result.data.url;

      setResponses(prev => ({
        ...prev,
        [questionId]: fileUrl,
      }));
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'An unexpected error occurred while uploading the file.');
    }
  };

  const handleInputChange = (questionId: string, value: string | File, questionType: SurveyQuestion['type']) => {
    if (questionType === 'file-upload' && value instanceof File) {
      handleFileUpload(questionId, value);
    } else {
      setResponses(prev => {
        const newResponses = { ...prev };
        if (questionType === 'multiple-choice') {
          const currentAnswers = (newResponses[questionId] || []) as string[];
          if (currentAnswers.includes(value as string)) {
            newResponses[questionId] = currentAnswers.filter(ans => ans !== value);
          } else {
            newResponses[questionId] = [...currentAnswers, value as string];
          }
        } else {
          newResponses[questionId] = value as string;
        }
        return newResponses;
      });
    }
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
                        value={(responses[q.id || `q-${index}`] as string) || ''}
                        onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                        className="mt-1"
                        disabled={isSubmitting || !!successMessage}
                        required={q.isRequired}
                      />
                    )}
                    {q.type === 'textarea' && (
                      <textarea
                        id={q.id || `q-input-${index}`}
                        value={(responses[q.id || `q-${index}`] as string) || ''}
                        onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        disabled={isSubmitting || !!successMessage}
                        required={q.isRequired}
                      />
                    )}
                    {q.type === 'single-choice' && q.options && q.options.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {q.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id || `q-radio-${index}`}
                              value={option}
                              checked={(responses[q.id || `q-${index}`] as string) === option}
                              onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                              className="text-primary-600 focus:ring-primary-500"
                              disabled={isSubmitting || !!successMessage}
                              required={q.isRequired && optIndex === 0} // Basic required validation on first radio
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'multiple-choice' && q.options && q.options.length > 0 && (
                       <div className="mt-2 space-y-2">
                        {q.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name={`${q.id || `q-check-${index}`}-${optIndex}`}
                              value={option}
                              checked={((responses[q.id || `q-${index}`] || []) as string[]).includes(option)}
                              onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                              className="rounded text-primary-600 focus:ring-primary-500"
                              disabled={isSubmitting || !!successMessage}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'range' && (
                      <input
                        type="range"
                        id={q.id || `q-input-${index}`}
                        min="1"
                        max={q.maxRating || 5}
                        value={(responses[q.id || `q-${index}`] as string) || ''}
                        onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                        className="mt-1"
                        disabled={isSubmitting || !!successMessage}
                        required={q.isRequired}
                      />
                    )}
                    {q.type === 'nps' && (
                      <div className="flex justify-between">
                        {[...Array(11)].map((_, i) => (
                          <label key={i} className="flex flex-col items-center space-y-1 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id || `q-radio-${index}`}
                              value={i}
                              checked={(responses[q.id || `q-${index}`] as string) === String(i)}
                              onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                              className="text-primary-600 focus:ring-primary-500"
                              disabled={isSubmitting || !!successMessage}
                              required={q.isRequired}
                            />
                            <span>{i}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'ces' && (
                      <div className="flex justify-between">
                        {[...Array(5)].map((_, i) => (
                          <label key={i} className="flex flex-col items-center space-y-1 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id || `q-radio-${index}`}
                              value={i + 1}
                              checked={(responses[q.id || `q-${index}`] as string) === String(i + 1)}
                              onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                              className="text-primary-600 focus:ring-primary-500"
                              disabled={isSubmitting || !!successMessage}
                              required={q.isRequired}
                            />
                            <span>{i + 1}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'image-choice' && q.options && q.options.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {q.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex flex-col items-center space-y-2 cursor-pointer">
                            <img src={option} alt={`Option ${optIndex + 1}`} className="w-32 h-32 object-cover rounded-md" />
                            <input
                              type="checkbox"
                              name={`${q.id || `q-check-${index}`}-${optIndex}`}
                              value={option}
                              checked={((responses[q.id || `q-${index}`] || []) as string[]).includes(option)}
                              onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                              className="rounded text-primary-600 focus:ring-primary-500"
                              disabled={isSubmitting || !!successMessage}
                            />
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'file-upload' && (
                      <Input
                        id={q.id || `q-input-${index}`}
                        type="file"
                        accept={q.allowedFileTypes}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileUpload(q.id || `q-${index}`, e.target.files[0]);
                          }
                        }}
                        className="mt-1"
                        disabled={isSubmitting || !!successMessage}
                        required={q.isRequired}
                      />
                    )}
                    {q.type === 'video' && (
                      <div>
                        <video src={q.videoUrl} controls className="w-full rounded-md" />
                        <Input
                          id={q.id || `q-input-${index}`}
                          placeholder="Your response"
                          value={(responses[q.id || `q-${index}`] as string) || ''}
                          onChange={(e) => handleInputChange(q.id || `q-${index}`, e.target.value, q.type)}
                          className="mt-2"
                          disabled={isSubmitting || !!successMessage}
                          required={q.isRequired}
                        />
                      </div>
                    )}
                    {/* Add other question types here later */}
                    {q.isRequired && <span className="text-xs text-error-500 ml-1">Required</span>}
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
