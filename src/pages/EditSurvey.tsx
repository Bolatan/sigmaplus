import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SurveyQuestion } from '../types';
import SurveyForm from '../components/surveys/SurveyForm';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import useApi from '../hooks/useApi';

interface SurveyFormData {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  agentId?: string;
  companyIds?: string[];
  headTeacherName?: string;
  contactNumber?: string;
}

const EditSurvey: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [formData, setFormData] = useState<SurveyFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const apiFetch = useApi();
  const [agents, setAgents] = useState<Record<string, unknown>[]>([]);
  const [companies, setCompanies] = useState<Record<string, unknown>[]>([]);
  const [surveys, setSurveys] = useState<Record<string, unknown>[]>([]);
  const [projects, setProjects] = useState<{ _id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchSurvey = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiFetch(`/surveys/${surveyId}`);
        setFormData({
          title: data.title,
          description: data.description,
          questions: data.questions || [],
          agentId: data.agentId,
          companyIds: data.companyIds,
          headTeacherName: data.headTeacherName,
          contactNumber: data.contactNumber,
        });
      } catch (error: any) {
        setApiError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, apiFetch]);

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [agentsData, companiesData, surveysData, projectsData] = await Promise.all([
          apiFetch('/users?role=agent'),
          apiFetch('/companies'),
          apiFetch('/surveys'),
          apiFetch('/projects'),
        ]);

        setAgents(agentsData.data || []);
        setCompanies(companiesData.data || []);
        setSurveys(surveysData.data || []);
        setProjects(projectsData.data || []);
      } catch (error) {
        console.error("Failed to fetch related data:", error);
      }
    };

    fetchRelatedData();
  }, [apiFetch]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setApiError(null);
    try {
      await apiFetch(`/surveys/${surveyId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      navigate(`/surveys/${surveyId}`);
    } catch (error: any) {
      setApiError(error.message);
    }
  }, [formData, surveyId, navigate, apiFetch]);

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
          surveys={surveys}
          user={user}
        />
      </CardContent>
    </Card>
  );
};

export default EditSurvey;
