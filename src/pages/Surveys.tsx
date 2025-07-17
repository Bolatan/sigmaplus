import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Survey, SurveyQuestion } from '../types';
import SurveyForm from '../components/surveys/SurveyForm';

const Surveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    questions: SurveyQuestion[];
    agentId?: string;
    companyIds?: string[];
  }>({
    title: '',
    description: '',
    questions: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([]);
  const [companies, setCompanies] = useState<{ _id: string; name: string }[]>([]);

  const fetchSurveys = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setApiError("No authentication token found. Please login.");
      setIsLoading(false);
      setSurveys([]);
      return;
    }

    try {
      const response = await fetch('/api/surveys', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setApiError(errorData.msg || errorData.error || `HTTP error! status: ${response.status}`);
        setSurveys([]);
      } else {
        const result = await response.json();
        const fetchedSurveys = (result.data || []).map((s: Survey) => ({
          ...s,
          id: s._id,
          createdAt: s.createdAt || new Date().toISOString(),
          responseCount: s.responseCount || 0,
          status: s.status || 'draft',
          questions: s.questions || [],
        }));
        setSurveys(fetchedSurveys);
      }
    } catch (error: any) {
      if (!apiError) setApiError(error.message || 'Failed to fetch surveys from API.');
      setSurveys([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiError]);

  const triggerRefetch = useCallback(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      questions: [],
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchSurveys();
    }
  }, [user, fetchSurveys]);

  useEffect(() => {
    const fetchAgentsAndCompanies = async () => {
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
      } catch (error) {
        console.error("Failed to fetch agents or companies:", error);
      }
    };

    fetchAgentsAndCompanies();
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

      setIsAddModalOpen(false);
      resetForm();
      triggerRefetch();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm, triggerRefetch]);

  const handleDelete = useCallback(async (surveyId: string) => {
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

      triggerRefetch();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while deleting the survey.');
    }
  }, [triggerRefetch]);

  const filteredSurveys = surveys.filter(survey =>
    (survey.title && survey.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create Survey
          </Button>
        )}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <Button
          variant="outline"
          leftIcon={<Filter className="h-5 w-5" />}
        >
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurveys.map((survey) => (
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
                    {(user?.role === 'admin' || user?.role === 'agent') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(survey.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Survey"
      >
        <SurveyForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAddSurvey}
          onCancel={() => setIsAddModalOpen(false)}
          buttonText="Create Survey"
          agents={agents}
          companies={companies}
          surveys={[]}
          user={user}
        />
      </Modal>

      {filteredSurveys.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No surveys found
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first survey to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Surveys;
