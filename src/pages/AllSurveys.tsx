import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { Survey, SurveyQuestion } from '../types';
import SurveyForm from '../components/surveys/SurveyForm';

const AllSurveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAddSurveyModalOpen, setIsAddSurveyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchPrerequisites = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const agentsResponse = await fetch('/api/users?role=agent', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (agentsResponse.ok) {
          const { data } = await agentsResponse.json();
          setAgents(data || []);
        }

        const companiesResponse = await fetch('/api/companies', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (companiesResponse.ok) {
          const { data } = await companiesResponse.json();
          setCompanies(data || []);
        }

        const projectsResponse = await fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (projectsResponse.ok) {
          const { data } = await projectsResponse.json();
          setProjects(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch prerequisites:", error);
      }
    };

    fetchAllSurveys();
    fetchPrerequisites();
  }, [user]);

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

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      questions: [],
    });
  }, []);

  const handleAddSurvey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    if (!formData.title.trim()) {
      setApiError("Survey title is required.");
      return;
    }

    try {
      const surveyResponse = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!surveyResponse.ok) {
        const errorData = await surveyResponse.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create survey: ${surveyResponse.statusText}`);
      }

      setIsAddSurveyModalOpen(false);
      resetForm();
      fetchAllSurveys();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm]);

  const handleDelete = async (surveyId: string) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) {
      return;
    }

    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
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

      fetchAllSurveys();
    } catch (err: any) {
      console.error('Error deleting survey:', err);
      setApiError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleActivateSurvey = async (surveyId: string) => {
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required.");
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'active' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `Failed to activate survey: ${response.statusText}`);
      }

      fetchAllSurveys();
    } catch (err: any) {
      console.error('Error activating survey:', err);
      setApiError(err.message || 'An unexpected error occurred.');
    }
  };

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
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => setIsAddSurveyModalOpen(true)}
          >
            Create Survey
          </Button>
        )}
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
                      onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/surveys/${survey.id}/respond`)}
                    >
                      Take Survey
                    </Button>
                    {survey.status === 'draft' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleActivateSurvey(survey.id)}
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(survey.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddSurveyModalOpen}
        onClose={() => setIsAddSurveyModalOpen(false)}
        title="Create New Survey"
      >
        <SurveyForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAddSurvey}
          onCancel={() => setIsAddSurveyModalOpen(false)}
          buttonText="Create Survey"
          agents={agents}
          companies={companies}
          projects={projects}
          user={user}
        />
      </Modal>

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
