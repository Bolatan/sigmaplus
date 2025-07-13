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

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
}

const SurveyForm: React.FC<{
  formData: SurveyFormData;
  onFormDataChange: (data: SurveyFormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
  agents: any[];
  user: any;
}> = React.memo(({ formData, onFormDataChange, onSubmit, onCancel, buttonText, agents, user }) => {

  if (!formData || !Array.isArray(formData.questions)) {
    return <div>Loading survey form...</div>;
  }

  const handleInputChange = useCallback((field: keyof Omit<SurveyFormData, 'questions'>, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  }, [formData, onFormDataChange]);

  const handleQuestionChange = useCallback((index: number, field: keyof SurveyQuestion, value: any) => {
    const newQuestions = [...formData.questions];
    // @ts-ignore
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onFormDataChange({ ...formData, questions: newQuestions });
  }, [formData, onFormDataChange]);

  const addQuestion = useCallback(() => {
    const newQuestion: SurveyQuestion = {
      id: uuidv4(),
      text: '',
      type: 'text',
      isRequired: false,
      options: []
    };
    onFormDataChange({ ...formData, questions: [...formData.questions, newQuestion] });
  }, [formData, onFormDataChange]);

  const removeQuestion = useCallback((index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    onFormDataChange({ ...formData, questions: newQuestions });
  }, [formData, onFormDataChange]);

  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  const openLogicModal = (index: number) => {
    setSelectedQuestionIndex(index);
    setIsLogicModalOpen(true);
  };

  const closeLogicModal = () => {
    setSelectedQuestionIndex(null);
    setIsLogicModalOpen(false);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        <Input
          label="Survey Title"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        required
      />
      <div>
        <label htmlFor="surveyDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="surveyDescription"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          rows={3}
          required
        />
      </div>

      {/* Questions Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-md font-semibold">Questions</h3>
        {(formData.questions || []).map((q, index) => ( // <-- Outer parenthesis starts here
          <div key={q.id || index} className="p-3 border rounded-md space-y-2 bg-gray-50">
            <Input
              label={`Question ${index + 1} Text`}
              value={q.text}
              onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                value={q.type}
                onChange={(e) => handleQuestionChange(index, 'type', e.target.value as QuestionType)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="single-choice">Single Choice (Radio)</option>
                <option value="multiple-choice">Multiple Choice (Checkbox)</option>
                <option value="rating">Rating (1-5)</option>
                <option value="nps">Net Promoter Score (NPS)</option>
                <option value="ces">Customer Effort Score (CES)</option>
                <option value="image-choice">Image Choice</option>
                <option value="file-upload">File Upload</option>
                <option value="video">Video</option>
              </select>
            </div>

            {/* Options for choice-based questions */}
            {(q.type === 'single-choice' || q.type === 'multiple-choice') && (
              <div className="mt-2 space-y-2 pl-4 border-l-2">
                {(q.options || []).map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={opt}
                      placeholder={`Option ${optIndex + 1}`}
                      onChange={(e) => {
                        const newOptions = [...(q.options || [])];
                        newOptions[optIndex] = e.target.value;
                        handleQuestionChange(index, 'options', newOptions);
                      }}
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        const newOptions = (q.options || []).filter((_, i) => i !== optIndex);
                        handleQuestionChange(index, 'options', newOptions);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(q.options || []), 'New Option'];
                    handleQuestionChange(index, 'options', newOptions);
                  }}
                  leftIcon={<Plus className="h-3 w-3" />}
                >
                  Add Option
                </Button>
              </div>
            )}

            {q.type === 'rating' && (
              <div className="mt-2">
                <Input
                  label="Max Rating"
                  type="number"
                  value={q.maxRating || 5}
                  onChange={(e) => handleQuestionChange(index, 'maxRating', parseInt(e.target.value, 10))}
                  min={2}
                  max={10}
                />
              </div>
            )}

            {q.type === 'video' && (
              <div className="mt-2">
                <Input
                  label="Video URL"
                  value={q.videoUrl || ''}
                  onChange={(e) => handleQuestionChange(index, 'videoUrl', e.target.value)}
                />
              </div>
            )}

            <div className="mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!q.isRequired}
                  onChange={(e) => handleQuestionChange(index, 'isRequired', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => removeQuestion(index)}
              className="mt-2"
            >
              Remove Question
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 ml-2"
              onClick={() => openLogicModal(index)}
            >
              Conditional Logic
            </Button>
          </div>
        ))} {/* <-- The crucial closing parenthesis and curly brace are correctly positioned here */}
        <Button type="button" variant="outline" onClick={addQuestion} leftIcon={<Plus className="h-4 w-4" />} className="mt-2">
          Add Question
        </Button>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {user?.role === 'admin' && (
          <div className="col-span-1">
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
              Assign to Agent (Optional)
            </label>
            <select
              id="agentId"
              name="agentId"
              value={formData.agentId || ''}
              onChange={(e) => onFormDataChange({ ...formData, agentId: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">-- Select Agent --</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} ({agent.email})
                </option>
              ))}
            </select>
          </div>
        )}
        <Button type="submit" variant="primary">
          {buttonText}
        </Button>
      </div>
    </form>
    <ConditionalLogicModal isOpen={isLogicModalOpen} onClose={closeLogicModal} />
    </>
));

SurveyForm.displayName = 'SurveyForm';

const Surveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
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
  const [apiSurveys, setApiSurveys] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetSurveyId, setUploadTargetSurveyId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      questions: [],
    });
    setEditingSurvey(null);
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

    fetchAgents();
  }, [user]);

  useEffect(() => {
    const fetchApiSurveys = async () => {
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
          const fetchedSurveys = (result.data || []).map((s: any) => ({
            ...s,
            id: s._id,
            createdAt: s.createdAt || new Date().toISOString(),
            responseCount: s.responseCount || 0,
            status: s.status || 'draft',
            questions: s.questions || [],
          }));
          setSurveys(fetchedSurveys);
          setApiSurveys(fetchedSurveys);
          console.log('Fetched from /api/surveys:', fetchedSurveys);
        }
      } catch (error: any) {
        console.error('Error fetching from /api/surveys:', error);
        if (!apiError) setApiError(error.message || 'Failed to fetch surveys from API.');
        setSurveys([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiSurveys();
  }, [user, apiError]);

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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create survey: ${response.statusText}`);
      }

      const newSurveyFromApi = await response.json();
      const newSurvey = { ...newSurveyFromApi, id: newSurveyFromApi._id, questions: newSurveyFromApi.questions || [] };

      setSurveys(prevSurveys => [newSurvey, ...prevSurveys]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding survey via API:', error);
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm]);

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
      const response = await fetch(`/api/surveys/${editingSurvey.id}`, {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update survey: ${response.statusText}`);
      }

      const updatedSurveyFromApi = await response.json();
      const updatedSurvey = { ...updatedSurveyFromApi, id: updatedSurveyFromApi._id, questions: updatedSurveyFromApi.questions || [] };

      setSurveys(prevSurveys =>
        prevSurveys.map(s => (s.id === updatedSurvey.id ? updatedSurvey : s))
      );
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error updating survey via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating the survey.');
    }
  }, [formData, editingSurvey, resetForm]);

  const handleStatusChange = useCallback(async (surveyId: string, newStatus: Survey['status']) => {
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    const originalSurveys = [...surveys];
    setSurveys(prevSurveys =>
      prevSurveys.map(s =>
        s.id === surveyId ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s
      )
    );

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setSurveys(originalSurveys);
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update survey status: ${response.statusText}`);
      }

      const updatedSurveyFromApi = await response.json();
      const finalUpdatedSurvey = { ...updatedSurveyFromApi, id: updatedSurveyFromApi._id, questions: updatedSurveyFromApi.questions || [] };
      setSurveys(prevSurveys =>
        prevSurveys.map(s => (s.id === finalUpdatedSurvey.id ? finalUpdatedSurvey : s))
      );

    } catch (error: any) {
      console.error('Error updating survey status via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating status.');
      setSurveys(originalSurveys);
    }
  }, [surveys]);

  const startEdit = useCallback((survey: Survey) => {
    setEditingSurvey(survey);
    setFormData({
      title: survey.title || '',
      description: survey.description || '',
      questions: survey.questions || [],
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

  const openUploadModal = useCallback((surveyId: string) => {
    setUploadTargetSurveyId(surveyId);
    setSelectedFile(null);
    setUploadStatusMessage(null);
    setIsUploadModalOpen(true);
  }, []);

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setUploadTargetSurveyId(null);
    setSelectedFile(null);
  }, []);

  const handleFileUpload = useCallback(async () => {
    if (!selectedFile || !uploadTargetSurveyId) {
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

      setUploadStatusMessage(result.message || 'Upload successful! Responses are being processed.');

    } catch (error: any) {
      console.error('Error uploading CSV file:', error);
      setUploadStatusMessage(`Error: ${error.message || 'An unexpected error occurred during upload.'}`);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, uploadTargetSurveyId]);

  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <div className="flex space-x-2">
            <Button
              variant="primary"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Create Survey
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Open template selection modal
              }}
            >
              Use Template
            </Button>
          </div>
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
                    )}
                    <Button
                      variant="outline"
                      size="sm"
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

            {q.type === 'file-upload' && (
              <div className="mt-2">
                <Input
                  label="Allowed File Types (e.g., .pdf,.jpg,.png)"
                  value={q.allowedFileTypes || ''}
                  onChange={(e) => handleQuestionChange(index, 'allowedFileTypes', e.target.value)}
                />
              </div>
            )}
    </div>
  );
};

export default Surveys;
