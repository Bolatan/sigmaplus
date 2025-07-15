import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, BarChart2, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { Survey, SurveyQuestion } from '../types';
import SurveyForm from '../components/surveys/SurveyForm';
import EditProjectModal from '../components/projects/EditProjectModal';

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface SurveyFormData {
  title: string;
  description: string;
  agentId?: string;
  companyIds?: string[];
  projectId?: string;
}

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddSurveyModalOpen, setIsAddSurveyModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    projectId: projectId,
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const triggerRefetch = () => {
    fetchProjectAndSurveys();
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      projectId: projectId,
    });
  }, [projectId]);

  const fetchProjectAndSurveys = async () => {
    setIsLoading(true);
    setApiError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setApiError("No authentication token found. Please login.");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch project details
      const projectResponse = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json().catch(() => ({}));
        setApiError(errorData.msg || errorData.error || `HTTP error! status: ${projectResponse.status}`);
        setIsLoading(false);
        return;
      }

      const projectResult = await projectResponse.json();
      setProject({ ...projectResult.data, id: projectResult.data._id });

      // Fetch surveys for the project
      const surveyResponse = await fetch(`/api/surveys?projectId=${projectId}`, {
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
    } catch (error: any) {
      if (!apiError) setApiError(error.message || 'Failed to fetch project details from API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndSurveys();
  }, [projectId, user]);

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

      setIsAddSurveyModalOpen(false);
      resetForm();
      triggerRefetch();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm]);

  const handleUpdateProject = async (updatedProject: Project) => {
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${updatedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update project: ${response.statusText}`);
      }

      setIsEditProjectModalOpen(false);
      triggerRefetch();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while updating the project.');
    }
  };

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

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Project not found
        </h3>
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
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="flex space-x-2">
          {(user?.role === 'admin' || user?.role === 'agent') && (
            <Button
              variant="outline"
              leftIcon={<Edit className="h-5 w-5" />}
              onClick={() => setIsEditProjectModalOpen(true)}
            >
              Edit Project
            </Button>
          )}
          {(user?.role === 'admin' || user?.role === 'agent') && (
            <Button
              variant="primary"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => {
                console.log('Add Survey button clicked');
                setIsAddSurveyModalOpen(true);
              }}
            >
              Add Survey
            </Button>
          )}
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

      <Modal
        isOpen={isAddSurveyModalOpen}
        onClose={() => setIsAddSurveyModalOpen(false)}
        title="Add New Survey"
      >
        <SurveyForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAddSurvey}
          onCancel={() => setIsAddSurveyModalOpen(false)}
          buttonText="Add Survey"
          agents={agents}
          companies={companies}
          surveys={surveys}
          user={user}
        />
      </Modal>

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={project}
        onSave={handleUpdateProject}
      />

      {surveys.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No surveys found for this project
          </h3>
          <p className="text-gray-500">
            Add a survey to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
