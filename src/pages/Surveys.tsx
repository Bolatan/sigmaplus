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

// INITIAL_SURVEYS array removed as data is now fetched from API

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
    const fetchApiSurveys = async () => {
      setIsLoading(true); // Start loading
      setApiError(null); // Reset error
      const token = localStorage.getItem('authToken');

      if (!token) {
        setApiError("No authentication token found. Please login.");
        setIsLoading(false);
        setSurveys([]); // Set to empty array if no token
        return;
      }

      try {
        const response = await fetch('/api/surveys', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
          setApiError(errorData.msg || errorData.error || `HTTP error! status: ${response.status}`);
          setSurveys([]); // Set to empty array on error
        } else {
          const result = await response.json();
          // Assuming result.data contains the array of surveys from backend
          // And backend _id needs to be mapped to id for frontend Survey type
          const fetchedSurveys = (result.data || []).map((s: any) => ({
            ...s,
            id: s._id, // Map _id to id
            // Ensure other fields match the frontend Survey interface if necessary
            // For example, if backend sends date strings but frontend expects Date objects (though string is fine for display)
            createdAt: s.createdAt || new Date().toISOString(), // Provide default if missing
            responseCount: s.responseCount || 0,
            status: s.status || 'draft',
          }));
          setSurveys(fetchedSurveys); // Set surveys state with data from API
          setApiSurveys(fetchedSurveys); // Also update apiSurveys if you use it elsewhere
          console.log('Fetched from /api/surveys:', fetchedSurveys);
        }
      } catch (error: any) {
        console.error('Error fetching from /api/surveys:', error);
        if (!apiError) setApiError(error.message || 'Failed to fetch surveys from API.');
        setSurveys([]); // Set to empty array on critical error
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchApiSurveys();
  }, [user]); // Re-fetch if user context changes (e.g., login/logout)

  // loadSurveys and saveSurveys functions are no longer needed as all data operations use API.
  // Removed them.

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
  }, [formData, surveys, saveSurveys]); // saveSurveys will be removed later

  const handleAddSurvey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); // Clear previous errors
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    // Basic frontend validation (though backend also validates)
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
          // status: 'draft', // Backend defaults to draft, or can be sent
          // questions: [], // Can be sent if form supports it
          // companyId: can be sent if admin and form supports it
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to create survey: ${response.statusText}`);
      }

      const newSurveyFromApi = await response.json();
      // The backend now returns the full survey object, map _id to id if needed by frontend type
      const newSurvey = { ...newSurveyFromApi, id: newSurveyFromApi._id };


      setSurveys(prevSurveys => [newSurvey, ...prevSurveys]); // Add to top for immediate visibility
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding survey via API:', error);
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm]); // Removed surveys and saveSurveys from deps

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
  }, [formData, editingSurvey, surveys, saveSurveys]); // saveSurveys will be removed

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

    // Basic frontend validation
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
          // status: can be sent if form supports it
          // questions: can be sent if form supports it
          // companyId: can be sent if admin and form supports it
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update survey: ${response.statusText}`);
      }

      const updatedSurveyFromApi = await response.json();
      // Backend controller for update now returns the full updated document.
      // Map _id to id if necessary for frontend type.
      const updatedSurvey = { ...updatedSurveyFromApi, id: updatedSurveyFromApi._id };


      setSurveys(prevSurveys =>
        prevSurveys.map(s => (s.id === updatedSurvey.id ? updatedSurvey : s))
      );
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error updating survey via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating the survey.');
    }
  }, [formData, editingSurvey, resetForm]); // Removed surveys and saveSurveys

  const handleStatusChange = useCallback(async (surveyId: string, newStatus: Survey['status']) => {
    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required. Please login.");
      return;
    }

    // Optimistically update UI first
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
        body: JSON.stringify({ status: newStatus }), // Only send the status to update
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Revert optimistic update on error
        setSurveys(originalSurveys);
        throw new Error(errorData.errors?.[0]?.msg || errorData.error || errorData.msg || `Failed to update survey status: ${response.statusText}`);
      }

      const updatedSurveyFromApi = await response.json();
      // Update with the confirmed data from API to ensure consistency (e.g. updatedAt timestamp from server)
      const finalUpdatedSurvey = { ...updatedSurveyFromApi, id: updatedSurveyFromApi._id };
      setSurveys(prevSurveys =>
        prevSurveys.map(s => (s.id === finalUpdatedSurvey.id ? finalUpdatedSurvey : s))
      );

    } catch (error: any) {
      console.error('Error updating survey status via API:', error);
      setApiError(error.message || 'An unexpected error occurred while updating status.');
      // Revert optimistic update if not already done (e.g. network error before response.ok check)
      setSurveys(originalSurveys);
    }
  }, [surveys]); // Removed saveSurveys from deps

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