import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, BarChart2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button.tsx'; // Explicit .tsx extension
import { Input } from '../components/ui/Input.tsx';   // Explicit .tsx extension
import { Card, CardContent } from '../components/ui/Card.tsx'; // Explicit .tsx extension
import { Modal } from '../components/ui/Modal.tsx';   // Explicit .tsx extension
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Survey, SurveyQuestion, QuestionType } from '../types'; // Assuming Survey type is suitable for Project
import { v4 as uuidv4 } from 'uuid';
import { ConditionalLogicModal } from '../components/surveys/ConditionalLogicModal'; // Re-using survey modals
import { TemplateSelectionModal } from '../components/surveys/TemplateSelectionModal'; // Re-using survey templates
import SurveyForm from '../components/surveys/SurveyForm.tsx'; // Corrected import

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
  companyIds?: string[];
  projectId?: string; // Added projectId to ProjectFormData
}

const Projects: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]); // Using Survey type as projects seem to be surveys
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    questions: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiProjects, setApiProjects] = useState<any>(null); // This might be redundant if projects state is used
  const [apiError, setApiError] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetSurveyId, setUploadTargetSurveyId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSurveyStatusMessage, setUploadSurveyStatusMessage] = useState<string | null>(null);
  const [isUploadingSurvey, setIsUploadingSurvey] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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
    setEditingSurvey(null);
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
      // Assuming non-admin users might also need company data for dropdowns/filters
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

    const fetchAllProjects = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const { data } = await response.json();
          setProjects(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchAgents();
    fetchCompanies();
    fetchAllProjects();
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
        setSurveys([]);
        return;
      }

      try {
        // Assuming projects are fetched from the /api/surveys endpoint
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
          const fetchedSurveys = (result.data || []).map((s: any) => ({
            ...s,
            id: s._id,
            createdAt: s.createdAt || new Date().toISOString(),
            responseCount: s.responseCount || 0,
            status: s.status || 'draft',
            questions: s.questions || [],
          }));
          setSurveys(fetchedSurveys);
          setApiProjects(fetchedSurveys); // Keeping this for now, but `surveys` state is primary
          console.log('Fetched from /api/surveys (acting as projects):', fetchedSurveys);
        }
      } catch (error: any) {
        console.error('Error fetching from /api/surveys (acting as projects):', error);
        if (!apiError) setApiError(error.message || 'Failed to fetch surveys from API.');
        setSurveys([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiProjects();
  }, [user, shouldRefetch]); // Removed apiError from dependencies to prevent infinite loop if error always changes

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
      // First, create the project
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!projectResponse.ok) {
        const errorData = await projectResponse.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create project: ${projectResponse.statusText}`);
      }

      const { data: newProject } = await projectResponse.json();

      // Then, create the survey with the new project's ID
      const surveyResponse = await fetch('/api/surveys', {
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
          projectId: newProject._id, // Use the new project's ID
        }),
      });

      if (!surveyResponse.ok) {
        const errorData = await surveyResponse.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create survey: ${surveyResponse.statusText}`);
      }

      const { data: newSurvey } = await surveyResponse.json();

      setProjects(prevProjects => [newProject, ...prevProjects]);
      setSurveys(prevSurveys => [newSurvey, ...prevSurveys]);
      setIsAddModalOpen(false);
      resetForm();
      triggerRefetch(); // Trigger refetch to update the list
    } catch (error: any) {
      console.error('Error adding survey via API:', error);
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm, triggerRefetch]);

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) {
      return;
    }

    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, { // Deleting a survey
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to delete survey: ${response.statusText}`);
      }

      setSurveys(prevSurveys => prevSurveys.filter(p => p.id !== surveyId));
    } catch (error: any) {
      console.error('Error deleting survey via API:', error);
      setApiError(error.message || 'An unexpected error occurred while deleting the survey.');
    }
  };

  const handleEditSurvey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSurvey || !editingSurvey.id) {
      setApiError("No survey selected for editing or survey ID is missing.");
      return;
    }
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
      const response = await fetch(`/api/surveys/${editingSurvey.id}`, { // Updating a survey
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
          projectId: formData.projectId, // Include projectId in the payload
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update survey: ${response.statusText}`);
      }

      const { data: updatedSurveyFromApi } = await response.json();
      const updatedSurvey = { ...updatedSurveyFromApi, id: updatedSurveyFromApi._id, questions: updatedSurveyFromApi.questions || [] };

      setSurveys(prevSurveys =>
        prevSurveys.map(p => (p.id === updatedSurvey.id ? updatedSurvey : p))
      );
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error updating survey via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating the survey.');
    }
  }, [formData, editingSurvey, resetForm]);

  const handleSurveyStatusChange = useCallback(async (surveyId: string, newStatus: Survey['status']) => {
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    const originalSurveys = [...surveys];
    setSurveys(prevSurveys =>
      prevSurveys.map(p =>
        p.id === surveyId ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p
      )
    );

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, { // Updating survey status
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setSurveys(originalSurveys); // Revert on error
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update survey status: ${response.statusText}`);
      }

      const updatedSurveyFromApi = await response.json();
      const finalUpdatedSurvey = { ...updatedSurveyFromApi, id: updatedSurveyFromApi._id, questions: updatedSurveyFromApi.questions || [] };
      setSurveys(prevSurveys =>
        prevSurveys.map(p => (p.id === finalUpdatedSurvey.id ? finalUpdatedSurvey : p))
      );

    } catch (error: any) {
      console.error('Error updating survey status via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating status.');
      setSurveys(originalSurveys); // Revert on error
    }
  }, [surveys]);

  const startEditSurvey = useCallback((survey: Survey) => {
    setEditingSurvey(survey);
    setFormData({
      title: survey.title || '',
      description: survey.description || '',
      questions: survey.questions || [],
      companyIds: survey.companyIds || [],
      projectId: survey.projectId || '', // Set projectId for editing
    });
    setIsEditModalOpen(true);
  }, []);

  const handleSurveyFormDataChange = useCallback((newFormData: SurveyFormData) => {
    setFormData(newFormData);
  }, []);

  const handleCancelAddSurvey = useCallback(() => {
    setIsAddModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleCancelEditSurvey = useCallback(() => {
    setIsEditModalOpen(false);
    resetForm();
  }, [resetForm]);

  const openUploadModal = useCallback((surveyId: string) => {
    setUploadTargetSurveyId(surveyId);
    setSelectedFile(null);
    setUploadSurveyStatusMessage(null);
    setIsUploadSurveyModalOpen(true);
  }, []);

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setUploadTargetSurveyId(null);
    setSelectedFile(null);
  }, []);

  const handleSurveyFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files ? e.target.files[0] : null);
    setUploadStatusMessage(null); // Clear previous status message on new file selection
  }, []);

  const handleSurveyFileUpload = useCallback(async () => {
    if (!selectedFile || !uploadTargetSurveyId) {
      setUploadSurveyStatusMessage("Error: Please select a file.");
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setUploadSurveyStatusMessage("Error: Authentication required. Please log in again.");
      setIsUploadingSurvey(false);
      return;
    }

    setIsUploadingSurvey(true);
    setUploadSurveyStatusMessage('Uploading...');

    const formData = new FormData();
    formData.append('responsesCsv', selectedFile);

    try {
      const response = await fetch(`/api/surveys/${uploadTargetSurveyId}/responses/bulk-upload`, {
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

      setUploadSurveyStatusMessage(result.message || 'Upload successful! Responses are being processed.');
      triggerRefetch(); // Refresh projects list to show updated response count

    } catch (error: any) {
      console.error('Error uploading CSV file:', error);
      setUploadSurveyStatusMessage(`Error: ${error.message || 'An unexpected error occurred during upload.'}`);
    } finally {
      setIsUploadingSurvey(false);
    }
  }, [selectedFile, uploadTargetSurveyId, triggerRefetch]);

  const filteredSurveys = surveys.filter(survey =>
    (survey.title && survey.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
            placeholder="Search projects..."
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
                        onClick={() => startEditSurvey(survey)}
                      >
                        Edit
                      </Button>
                    )}
                    {(user?.role === 'admin' || user?.role === 'agent') && (
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
                        onClick={() => openUploadSurveyModal(survey.id)}
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
                        onClick={() => handleSurveyStatusChange(survey.id, 'active')}
                      >
                        Activate
                      </Button>
                    )}
                    {survey.status === 'active' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSurveyStatusChange(survey.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    {survey.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSurveyStatusChange(survey.id, 'active')}
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
        onClose={handleCancelAddSurvey}
        title="Create New Survey"
      >
        <SurveyForm
          formData={formData}
          onFormDataChange={handleSurveyFormDataChange}
          onSubmit={handleAddSurvey}
          onCancel={handleCancelAddSurvey}
          buttonText="Create Survey"
          agents={agents}
          companies={companies}
          projects={projects}
          user={user}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEditSurvey}
        title="Edit Survey"
      >
        <SurveyForm
          formData={formData}
          onFormDataChange={handleSurveyFormDataChange}
          onSubmit={handleEditSurvey}
          onCancel={handleCancelEditSurvey}
          buttonText="Save Changes"
          agents={agents}
          companies={companies}
          projects={projects}
          user={user}
        />
      </Modal>

      {/* CSV Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadSurveyModal}
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
              onChange={handleSurveyFileChange} // Use the new handleFileChange
              className="mt-1 block w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-primary-50 file:text-primary-700
                         hover:file:bg-primary-100"
            />
          </div>

          {uploadSurveyStatusMessage && (
            <div className={`p-3 rounded-md text-sm ${uploadSurveyStatusMessage.startsWith('Error') || uploadSurveyStatusMessage.startsWith('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {uploadSurveyStatusMessage}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseUploadSurveyModal}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSurveyFileUpload}
              variant="primary"
              disabled={!selectedFile || isUploadingSurvey}
            >
              {isUploadingSurvey ? 'Uploading...' : 'Upload File'}
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

export default Projects;
