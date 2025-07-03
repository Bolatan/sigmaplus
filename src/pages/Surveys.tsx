import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, BarChart2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  responseCount: number;
  createdAt: string;
}

// Initial surveys data that will be stored in localStorage
const INITIAL_SURVEYS: Survey[] = [
  {
    id: '1',
    title: 'Customer Satisfaction Survey',
    description: 'Quarterly customer satisfaction assessment for Q1 2024',
    status: 'completed',
    responseCount: 25,
    createdAt: '2024-01-15T08:00:00.000Z'
  },
  {
    id: '2',
    title: 'Brand Awareness Study',
    description: 'Market research study to measure brand recognition and recall',
    status: 'completed',
    responseCount: 30,
    createdAt: '2024-01-20T08:00:00.000Z'
  },
  {
    id: '3',
    title: 'Product Feedback Survey',
    description: 'Collecting feedback on new product features and usability',
    status: 'active',
    responseCount: 15,
    createdAt: '2024-02-01T08:00:00.000Z'
  },
  {
    id: '4',
    title: 'Employee Engagement Survey',
    description: 'Internal survey to measure employee satisfaction and engagement',
    status: 'draft',
    responseCount: 0,
    createdAt: '2024-02-05T08:00:00.000Z'
  }
];

// Separate SurveyForm component to prevent re-renders
const SurveyForm: React.FC<{
  formData: {
    title: string;
    description: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  buttonText: string;
}> = React.memo(({ formData, onFormDataChange, onSubmit, onCancel, buttonText }) => {
  const handleInputChange = useCallback((field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  }, [formData, onFormDataChange]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Survey Title"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          rows={4}
          required
        />
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
});

SurveyForm.displayName = 'SurveyForm';

const Surveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const { user } = useAuth();
  const [apiSurveys, setApiSurveys] = useState<any>(null); // For data from /api/surveys
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchApiSurveys = async () => {
      try {
        const response = await fetch('/api/surveys');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApiSurveys(data);
        console.log('Fetched from /api/surveys:', data);
        // You might want to integrate this data with your existing 'surveys' state
        // or use it directly, depending on your application logic.
        // For now, it's stored separately.
      } catch (error: any) {
        console.error('Error fetching from /api/surveys:', error);
        setApiError(error.message || 'Failed to fetch surveys from API');
      }
    };

    fetchApiSurveys();
    loadSurveys(); // Keep existing localStorage logic for now
  }, []);

  const loadSurveys = () => {
    try {
      // Load surveys from localStorage or use initial data
      const savedSurveys = localStorage.getItem('surveys');
      if (savedSurveys) {
        setSurveys(JSON.parse(savedSurveys));
      } else {
        // Initialize with default surveys and save to localStorage
        setSurveys(INITIAL_SURVEYS);
        localStorage.setItem('surveys', JSON.stringify(INITIAL_SURVEYS));
      }
    } catch (error) {
      console.error('Error loading surveys from localStorage:', error);
      setSurveys(INITIAL_SURVEYS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSurveys = useCallback((updatedSurveys: Survey[]) => {
    try {
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
      setSurveys(updatedSurveys);
    } catch (error) {
      console.error('Error saving surveys:', error);
    }
  }, []);

  const handleAddSurvey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSurvey: Survey = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        responseCount: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedSurveys = [...surveys, newSurvey];
      saveSurveys(updatedSurveys);
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding survey:', error);
    }
  }, [formData, surveys, saveSurveys]);

  const handleEditSurvey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSurvey) return;

    try {
      const updatedSurvey: Survey = {
        ...editingSurvey,
        ...formData,
      };

      const updatedSurveys = surveys.map(survey => 
        survey.id === editingSurvey.id ? updatedSurvey : survey
      );
      saveSurveys(updatedSurveys);
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating survey:', error);
    }
  }, [formData, editingSurvey, surveys, saveSurveys]);

  const handleStatusChange = useCallback((surveyId: string, newStatus: 'draft' | 'active' | 'completed') => {
    const updatedSurveys = surveys.map(survey =>
      survey.id === surveyId 
        ? { ...survey, status: newStatus }
        : survey
    );
    saveSurveys(updatedSurveys);
  }, [surveys, saveSurveys]);

  const startEdit = useCallback((survey: Survey) => {
    setEditingSurvey(survey);
    setFormData({
      title: survey.title,
      description: survey.description,
    });
    setIsEditModalOpen(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
    });
    setEditingSurvey(null);
  }, []);

  const handleFormDataChange = useCallback((newFormData: any) => {
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
      {/* Optional: Display data fetched from API for debugging/verification */}
      {/* {apiSurveys && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
          <p className="font-bold">Data from /api/surveys:</p>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(apiSurveys, null, 2)}</pre>
        </div>
      )} */}
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
        />
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