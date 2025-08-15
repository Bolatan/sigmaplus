import { useState, useEffect } from 'react';
import useApi from './useApi';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface DashboardStats {
  totalSurveys: number;
  totalResponses: number;
  reportsGenerated: number;
  averageCompletionRate: number;
  totalUsers?: number;
  totalCompanies: number;
  surveyStatusDistribution: { status: string; count: number }[];
  responsesBySurvey: { title: string; responseCount: number }[];
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const api = useApi();
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isClient = user?.role === UserRole.CLIENT;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const [
          surveysData,
          reportsData,
          companiesData,
          usersData,
          surveyStatusData,
          responsesBySurveyData,
        ] = await Promise.all([
          api('/surveys'),
          api('/reports'),
          api('/companies'),
          isAdmin ? api('/users') : Promise.resolve({ data: [] }),
          api('/stats/survey-statuses'),
          api('/stats/responses-by-survey'),
        ]);

        const allSurveys = surveysData.data || [];
        const allReports = reportsData.data || [];
        const finalStats: Partial<DashboardStats> = {
          totalCompanies: (companiesData.data || []).length,
          totalUsers: (usersData.data || []).length,
          surveyStatusDistribution: surveyStatusData.data || [],
          responsesBySurvey: responsesBySurveyData.data || [],
        };

        let relevantSurveys = allSurveys;
        let relevantReports = allReports;

        if (isClient && user.companyId) {
          const clientCompanyId = user.companyId.toString();
          relevantSurveys = allSurveys.filter((s: any) => s.companyId && s.companyId.toString() === clientCompanyId);
          relevantReports = allReports.filter((r: any) => r.companyId && r.companyId.toString() === clientCompanyId);
        }

        finalStats.totalSurveys = relevantSurveys.length;
        finalStats.totalResponses = relevantSurveys.reduce((acc: number, survey: any) => acc + (survey.responseCount || 0), 0);
        const completedSurveys = relevantSurveys.filter((survey: any) => survey.status === 'completed').length;
        finalStats.averageCompletionRate = relevantSurveys.length > 0 ? (completedSurveys / relevantSurveys.length) * 100 : 0;
        finalStats.reportsGenerated = relevantReports.length;

        setStats(finalStats);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, api, isAdmin, isClient]);

  return { stats, isLoading, error };
};
