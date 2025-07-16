import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SurveyQuestion } from '../types';
import SurveyForm from '../components/surveys/SurveyForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
  companyIds?: string[];
  projectId?: string;
}

const EditSurvey: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [formData, setFormData] = useState<SurveyFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Record<string, unknown>[]>([]);
  const [companies, setCompanies] = useState<Record<string, unknown>[]>([]);
  const [projects, setProjects] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const fetchSurvey = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setApiError("Authentication required.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/surveys/${surveyId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch survey data.');
        }

        const { data } = await response.json();
        setFormData({
          title: data.title,
          description: data.description,
          questions: data.questions || [],
          agentId: data.agentId,
          companyIds: Array.isArray(data.companyIds) ? data.companyIds.map((id: any) => id.toString()) : [],
          projectId: data.projectId,
        });
      } catch (error) {
        setApiError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  useEffect(() => {
    const fetchRelatedData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const [agentsRes, companiesRes, projectsRes] = await Promise.all([
          fetch('/api/users?role=agent', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/companies', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (agentsRes.ok) setAgents((await agentsRes.json()).data || []);
        if (companiesRes.ok) setCompanies((await companiesRes.json()).data || []);
        if (projectsRes.ok) setProjects((await projectsRes.json()).data || []);
      } catch (error) {
        console.error("Failed to fetch related data:", error);
      }
    };

    fetchRelatedData();
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setApiError(null);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setApiError("Authentication required.");
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update survey.');
      }

      navigate(`/surveys/${surveyId}`);
    } catch (error) {
      setApiError((error as Error).message);
    }
  }, [formData, surveyId, navigate]);

  if (isLoading) return <div>Loading...</div>;
  if (apiError) return <div className="text-red-500">{apiError}</div>;
  if (!formData) return <div>Survey not found.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Survey</CardTitle>
      </CardHeader>
      <CardContent>
        <SurveyForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleFormSubmit}
          onCancel={() => navigate(-1)}
          buttonText="Save Changes"
          agents={agents}
          companies={companies}
          projects={projects}
          user={user}
        />
      </CardContent>
    </Card>
  );
};

export default EditSurvey;
