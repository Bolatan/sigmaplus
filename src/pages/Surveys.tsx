import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Survey, SurveyQuestion } from '../types';
import SurveyForm from '../components/surveys/SurveyForm';
import useApi from '../hooks/useApi';

const Surveys: React.FC = () => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    questions: SurveyQuestion[];
    agentId?: string;
    companyIds?: string[];
    projectId?: string;
  }>({
    title: '',
    description: '',
    questions: [],
    projectId: '',
    companyIds: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const apiFetch = useApi();
  const [apiError, setApiError] = useState<string | null>(null);
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([]);
  const [companies, setCompanies] = useState<{ _id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ _id: string; title: string }[]>([]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      questions: [],
      projectId: '',
      companyIds: [],
    });
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [agentsData, companiesData, projectsData] = await Promise.all([
          apiFetch('/users?role=agent'),
          apiFetch('/companies'),
          apiFetch('/projects')
        ]);
        setAgents(agentsData.data || []);
        setCompanies(companiesData.data || []);
        setProjects(projectsData.data || []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
  }, [apiFetch]);

  const handleAddSurvey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!formData.title.trim()) {
      setApiError("Survey title is required.");
      return;
    }

    if (!formData.projectId) {
      setApiError("Please select a project.");
      return;
    }

    try {
      await apiFetch('/surveys', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      resetForm();
      navigate('/surveys');
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm, navigate, apiFetch]);

  return (
    <div className="p-6">
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold mr-1">API Error!</strong>
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Survey</h1>
      <SurveyForm
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleAddSurvey}
        onCancel={() => navigate('/surveys')}
        buttonText="Create Survey"
        agents={agents}
        companies={companies}
        projects={projects}
        user={user}
      />
    </div>
  );
};

export default Surveys;
