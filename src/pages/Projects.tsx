import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, BarChart2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Survey, SurveyQuestion, QuestionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ConditionalLogicModal } from '../components/surveys/ConditionalLogicModal';
import { TemplateSelectionModal } from '../components/surveys/TemplateSelectionModal';
import ProjectForm from '../components/projects/ProjectForm';

interface ProjectFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
  companyIds?: string[];
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Survey | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    questions: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiProjects, setApiProjects] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetProjectId, setUploadTargetProjectId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const triggerRefetch = () => {
    setShouldRefetch(prev => !prev);
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      questions: [],
    });
    setEditingProject(null);
  }, []);

  useEffect(() => {
    if (!formData.questions) {
      setFormData(prev => ({
        ...prev,
        questions: []
      }));
    }
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      if (user?.role !== 'admin') return;
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('/api/users?role=agent', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const { data } = await response.json();
          setAgents(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      }
    };

    const fetchCompanies = async () => {
      if (user?.role !== 'admin') return;
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('/api/companies', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const { data } = await response.json();
          setCompanies(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      }
    };

    fetchAgents();
    fetchCompanies();
  }, [user]);


  useEffect(() => {
    return () => {
      setApiError(null);
    };
  }, []);

  useEffect(() => {
    const fetchApiProjects = async () => {
      setIsLoading(true);
      setApiError(null);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setApiError("No authentication token found. Please login.");
        setIsLoading(false);
        setProjects([]);
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
          setProjects([]);
        } else {
          const result = await response.json();
          const fetchedProjects = (result.data || []).map((s: any) => ({
            ...s,
            id: s._id,
            createdAt: s.createdAt || new Date().toISOString(),
            responseCount: s.responseCount || 0,
            status: s.status || 'draft',
            questions: s.questions || [],
          }));
          setProjects(fetchedProjects);
          setApiProjects(fetchedProjects);
          console.log('Fetched from /api/surveys:', fetchedProjects);
        }
      } catch (error: any) {
        console.error('Error fetching from /api/surveys:', error);
        if (!apiError) setApiError(error.message || 'Failed to fetch projects from API.');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiProjects();
  }, [user, apiError, shouldRefetch]);

  const handleAddProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    if (!formData.title.trim()) {
        setApiError("Project title is required.");
        return;
    }

    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          questions: formData.questions,
          agentId: formData.agentId,
          companyIds: formData.companyIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create project: ${response.statusText}`);
      }

      const { data: newProjectFromApi } = await response.json();
      const newProject = { ...newProjectFromApi, id: newProjectFromApi._id, questions: newProjectFromApi.questions || [] };

      setProjects(prevProjects => [newProject, ...prevProjects]);
      setIsAddModalOpen(false);
      resetForm();
      triggerRefetch();
    } catch (error: any) {
      console.error('Error adding project via API:', error);
      setApiError(error.message || 'An unexpected error occurred while adding the project.');
    }
  }, [formData, resetForm, triggerRefetch]);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to delete project: ${response.statusText}`);
      }

      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    } catch (error: any) {
      console.error('Error deleting project via API:', error);
      setApiError(error.message || 'An unexpected error occurred while deleting the project.');
    }
  };

  const handleEditProject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.id) {
      setApiError("No project selected for editing or project ID is missing.");
      return;
    }
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    if (!formData.title.trim()) {
        setApiError("Project title is required.");
        return;
    }

    try {
      const response = await fetch(`/api/surveys/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          questions: formData.questions,
          agentId: formData.agentId,
          companyIds: formData.companyIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update project: ${response.statusText}`);
      }

      const { data: updatedProjectFromApi } = await response.json();
      const updatedProject = { ...updatedProjectFromApi, id: updatedProjectFromApi._id, questions: updatedProjectFromApi.questions || [] };

      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
      );
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error updating project via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating the project.');
    }
  }, [formData, editingProject, resetForm]);

  const handleStatusChange = useCallback(async (projectId: string, newStatus: Survey['status']) => {
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    const originalProjects = [...projects];
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p
      )
    );

    try {
      const response = await fetch(`/api/surveys/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setProjects(originalProjects);
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update project status: ${response.statusText}`);
      }

      const updatedProjectFromApi = await response.json();
      const finalUpdatedProject = { ...updatedProjectFromApi, id: updatedProjectFromApi._id, questions: updatedProjectFromApi.questions || [] };
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === finalUpdatedProject.id ? finalUpdatedProject : p))
      );

    } catch (error: any) {
      console.error('Error updating project status via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating status.');
      setProjects(originalProjects);
    }
  }, [projects]);

  const startEdit = useCallback((project: Survey) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      questions: project.questions || [],
      companyIds: project.companyIds || [],
    });
    setIsEditModalOpen(true);
  }, []);

  const handleFormDataChange = useCallback((newFormData: SurveyFormData) => {
    setFormData(newFormData);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setIsAddModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleCancelEdit = useCallback(() => {
    setIsEditModalOpen(false);
    resetForm();
  }, [resetForm]);

  const openUploadModal = useCallback((projectId: string) => {
    setUploadTargetProjectId(projectId);
    setSelectedFile(null);
    setUploadStatusMessage(null);
    setIsUploadModalOpen(true);
  }, []);

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setUploadTargetProjectId(null);
    setSelectedFile(null);
  }, []);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile || !uploadTargetProjectId) {
      setUploadStatusMessage("Error: Please select a file.");
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setUploadStatusMessage("Error: Authentication required. Please log in again.");
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    setUploadStatusMessage('Uploading...');

    const formData = new FormData();
    formData.append('responsesCsv', selectedFile);

    try {
      const response = await fetch(`/api/surveys/${uploadTargetProjectId}/responses/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.msg || result.error || result.message || `Failed to upload file: ${response.statusText}`);
      }

      setUploadStatusMessage(result.message || 'Upload successful! Responses are being processed.');

    } catch (error: any) {
      console.error('Error uploading CSV file:', error);
      setUploadStatusMessage(`Error: ${error.message || 'An unexpected error occurred during upload.'}`);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, uploadTargetProjectId]);

  const filteredProjects = projects.filter(project =>
    (project.title && project.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <AlertTriangle className="inline ml-2 h-5 w-5" />
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <div className="flex space-x-2">
            <Button
              variant="primary"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Create Project
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsTemplateModalOpen(true)}
            >
              Use Template
            </Button>
          </div>
        )}
      </div>

      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(template) => {
          setFormData({
            ...formData,
            questions: template,
          });
          setIsAddModalOpen(true);
        }}
      />

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
                    {(user?.role === 'admin' || user?.role === 'agent') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(survey)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteSurvey(survey.id)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/surveys/${survey.id}`)}
                    >
                      View Details
                    </Button>
                    {survey.status === 'active' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => navigate(`/surveys/${survey.id}/respond`)}
                        >
                          Take Survey
                        </Button>
                    )}
                      {(user?.role === 'admin' || user?.role === 'agent') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUploadModal(survey.id)}
                        className="ml-2"
                      >
                        Upload Responses
                      </Button>
                    )}
                  </div>
                </div>

                {(user?.role === 'admin' || user?.role === 'agent') && (
                  <div className="mt-3 flex space-x-2">
                    {survey.status === 'draft' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(survey.id, 'active')}
                      >
                        Activate
                      </Button>
                    )}
                    {survey.status === 'active' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(survey.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    {survey.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(survey.id, 'active')}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCancelAdd}
        title="Create New Survey"
      >
        <SurveyForm
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleAddSurvey}
          onCancel={handleCancelAdd}
          buttonText="Create Survey"
          agents={agents}
          companies={companies}
          user={user}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Edit Survey"
      >
        <SurveyForm
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onSubmit={handleEditSurvey}
          onCancel={handleCancelEdit}
          buttonText="Save Changes"
          agents={agents}
          companies={companies}
          user={user}
        />
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        title={`Bulk Upload Responses for Survey`}
      >
        <div className="space-y-4">
          {uploadTargetSurveyId && <p className="text-sm text-gray-600">Target Survey ID: <strong>{uploadTargetSurveyId}</strong></p>}
          <div>
            <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-1">
              Select CSV File
            </label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
            />
          </div>

          {uploadStatusMessage && (
            <div className={`p-3 rounded-md text-sm ${uploadStatusMessage.startsWith('Error') || uploadStatusMessage.startsWith('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {uploadStatusMessage}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseUploadModal}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFileUpload}
              variant="primary"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </div>
      </Modal>

      {filteredSurveys.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BarChart2 className="h-12 w-12 mx-auto" />
          </div>
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
