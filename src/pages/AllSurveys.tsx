import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { Survey } from '../types';

const AllSurveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllSurveys = async () => {
      setIsLoading(true);
      setApiError(null);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setApiError("No authentication token found. Please login.");
        setIsLoading(false);
        return;
      }

      try {
        const surveyResponse = await fetch(`/api/surveys`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!surveyResponse.ok) {
          const errorData = await surveyResponse.json().catch(() => ({}));
          setApiError(errorData.msg || errorData.error || `HTTP error! status: ${surveyResponse.status}`);
        } else {
          const surveyResult = await surveyResponse.json();
          const fetchedSurveys = (surveyResult.data || []).map((s: any) => ({
            ...s,
            id: s._id,
            createdAt: s.createdAt || new Date().toISOString(),
            responseCount: s.responseCount || 0,
            status: s.status || 'draft',
            questions: s.questions || [],
          }));
          setSurveys(fetchedSurveys);
        }
      } catch (error) {
        if (!apiError) setApiError(error.message || 'Failed to fetch surveys from API.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSurveys();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'completed':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold mr-1">API Error!</strong>
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Surveys</h1>
          <p className="text-sm text-gray-500 mt-1">Browse all surveys from all projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {survey.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {survey.description}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                  {survey.status}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-500 mt-4">
                <BarChart2 className="h-4 w-4 mr-1" />
                {survey.responseCount} responses
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Created {formatDate(survey.createdAt)}
                  </span>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/surveys/${survey.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {surveys.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No surveys found
          </h3>
          <p className="text-gray-500">
            There are currently no surveys available.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllSurveys;
