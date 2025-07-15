import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Survey {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  projectId: string;
  projectTitle?: string;
}

interface Project {
  _id: string;
  title: string;
}

const SurveysList: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const triggerRefetch = () => {
    fetchData();
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      projectId: '',
    });
  }, []);

  const fetchData = async () => {
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
      const [surveysResponse, projectsResponse] = await Promise.all([
        fetch('/api/surveys', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!surveysResponse.ok) {
        const errorData = await surveysResponse.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `HTTP error! status: ${surveysResponse.status}`);
      }
      if (!projectsResponse.ok) {
        const errorData = await projectsResponse.json().catch(() => ({}));
        throw new Error(errorData.msg || errorData.error || `HTTP error! status: ${projectsResponse.status}`);
      }

      const surveysResult = await surveysResponse.json();
      const projectsResult = await projectsResponse.json();
      const fetchedProjects = projectsResult.data || [];
      setProjects(fetchedProjects);

      const projectMap = new Map(fetchedProjects.map((p: Project) => [p._id, p.title]));

      const fetchedSurveys = (surveysResult.data || []).map((s: any) => ({
        ...s,
        id: s._id,
        createdAt: s.createdAt || new Date().toISOString(),
        projectTitle: projectMap.get(s.projectId) || 'N/A',
      }));
      setSurveys(fetchedSurveys);

    } catch (error: any) {
      if (!apiError) setApiError(error.message || 'Failed to fetch data from API.');
      setSurveys([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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
    if (!formData.projectId) {
      setApiError("Project is required.");
      return;
    }

    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create survey: ${response.statusText}`);
      }

      setIsAddModalOpen(false);
      resetForm();
      triggerRefetch();
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

      triggerRefetch();
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while deleting the survey.');
    }
  };

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
                  <p className="text-sm text-gray-500 mb-4">
                    Project: {survey.projectTitle}
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
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(survey.id)}
                        >
                          Delete
                        </Button>
                      </>
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
        <form onSubmit={handleAddSurvey} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700">Project</label>
            <select
              id="project"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Survey
            </Button>
          </div>
        </form>
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

export default SurveysList;
