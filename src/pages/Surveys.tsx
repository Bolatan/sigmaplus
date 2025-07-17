import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Survey, SurveyQuestion } from '../types';
import SurveyForm from '../components/surveys/SurveyForm';

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
  });
  const { user } = useAuth();
  const navigate = useNavigate();
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
    });
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const [agentsRes, companiesRes, projectsRes] = await Promise.all([
          fetch('/api/users?role=agent', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/companies', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (agentsRes.ok) {
          const { data } = await agentsRes.json();
          setAgents(data || []);
        }
        if (companiesRes.ok) {
          const { data } = await companiesRes.json();
          setCompanies(data || []);
        }
        if (projectsRes.ok) {
          const { data } = await projectsRes.json();
          setProjects(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
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

    if (!formData.projectId) {
      setApiError("Please select a project.");
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

      resetForm();
      navigate('/surveys');
    } catch (error: any) {
      setApiError(error.message || 'An unexpected error occurred while adding the survey.');
    }
  }, [formData, resetForm, navigate]);

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
