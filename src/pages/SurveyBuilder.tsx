import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SurveyBuilderLayout from '../components/layout/SurveyBuilderLayout';
import SurveyForm from '../components/surveys/SurveyForm';
import useApi from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { TemplateSelectionModal } from '../components/surveys/TemplateSelectionModal';
import { Button } from '../components/ui/Button';
import QuestionBankSidebar from '../components/surveys/QuestionBankSidebar';

const SurveyBuilderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
    projectId: '',
    agentId: '',
    companyIds: [],
  });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const api = useApi();
  const navigate = useNavigate();

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/survey-builder', formData);
      if (response.status === 201) {
        navigate('/surveys');
      }
    } catch (error) {
      console.error('Failed to create survey', error);
    }
  };

  const handleCancel = () => {
    navigate('/surveys');
  };

  const handleSelectTemplate = (template) => {
    setFormData({
      ...formData,
      questions: template,
    });
  };

  const handleDrop = (item) => {
    const newQuestion = { ...item.question, id: Date.now().toString() };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <SurveyBuilderLayout sidebar={<QuestionBankSidebar />}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Survey Builder</h1>
            <Button onClick={() => setIsTemplateModalOpen(true)}>Create from Template</Button>
          </div>
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('questions')}
                className={`${
                  activeTab === 'questions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`${
                  activeTab === 'design'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Design
              </button>
            </nav>
          </div>
          <div className="mt-8">
            {activeTab === 'questions' && (
              <SurveyForm
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                buttonText="Create Survey"
                agents={[]}
                companies={[]}
                projects={[]}
                user={{ role: 'admin' }} // This should be replaced with actual user data
                onDrop={handleDrop}
              />
            )}
            {activeTab === 'design' && (
              <div>
                <h2 className="text-2xl font-bold">Design Options</h2>
                <p className="mt-4">Design options will be here.</p>
              </div>
            )}
          </div>
          <TemplateSelectionModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      </SurveyBuilderLayout>
    </DndProvider>
  );
};

export default SurveyBuilderPage;
