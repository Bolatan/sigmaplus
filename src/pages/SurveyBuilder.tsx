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
    design: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#3b82f6',
    },
  });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const api = useApi();
  const navigate = useNavigate();

  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
  };

  const handleDesignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        [name]: value,
      },
    }));
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
                <div className="grid grid-cols-2 gap-8 mt-4">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">
                          Background Color
                        </label>
                        <input
                          type="color"
                          id="backgroundColor"
                          name="backgroundColor"
                          value={formData.design.backgroundColor}
                          onChange={handleDesignChange}
                          className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">
                          Text Color
                        </label>
                        <input
                          type="color"
                          id="textColor"
                          name="textColor"
                          value={formData.design.textColor}
                          onChange={handleDesignChange}
                          className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="buttonColor" className="block text-sm font-medium text-gray-700">
                          Button Color
                        </label>
                        <input
                          type="color"
                          id="buttonColor"
                          name="buttonColor"
                          value={formData.design.buttonColor}
                          onChange={handleDesignChange}
                          className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Preview</h3>
                    <div
                      className="mt-2 p-8 border rounded-md"
                      style={{ backgroundColor: formData.design.backgroundColor }}
                    >
                      <h4 className="text-2xl font-bold" style={{ color: formData.design.textColor }}>
                        {formData.title || 'Survey Title'}
                      </h4>
                      <p className="mt-2" style={{ color: formData.design.textColor }}>
                        {formData.description || 'This is a description of the survey.'}
                      </p>
                      <div className="mt-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium" style={{ color: formData.design.textColor }}>
                            Sample Question
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value="Sample answer"
                          />
                        </div>
                        <button
                          type="button"
                          style={{ backgroundColor: formData.design.buttonColor }}
                          className="text-white font-bold py-2 px-4 rounded"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-8">
                    <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleSubmit} className="btn-primary">Create Survey</button>
                </div>
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
