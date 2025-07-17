import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, ClipboardList, TrendingUp, Building2, UserCheck, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { StatCard } from '../components/dashboard/StatCard';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';
import { UserRole } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale);

interface DashboardStats {
  totalSurveys: number;
  totalResponses: number;
  reportsGenerated: number;
  averageCompletionRate: number; // Will be calculated from surveys
  totalUsers?: number; // Optional because only admins see this
  totalCompanies: number;
  // Trends can be added back later if actual trend data is available
  // surveyTrend: number;
  // responseTrend: number;
  // reportTrend: number;
  // completionRateTrend: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const api = useApi();
  const [stats, setStats] = useState<Partial<DashboardStats>>({
    totalSurveys: 0,
    totalResponses: 0,
    reportsGenerated: 0,
    averageCompletionRate: 0,
    totalCompanies: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyStatusChartData, setSurveyStatusChartData] = useState<any>(null);
  const [isSurveyStatusChartLoading, setIsSurveyStatusChartLoading] = useState(true);
  const [surveyStatusChartError, setSurveyStatusChartError] = useState<string | null>(null);

  const [surveyResponsesChartData, setSurveyResponsesChartData] = useState<any>(null);
  const [isSurveyResponsesChartLoading, setIsSurveyResponsesChartLoading] = useState(true);
  const [surveyResponsesChartError, setSurveyResponsesChartError] = useState<string | null>(null);

  const [reportTypesChartData, setReportTypesChartData] = useState<any>(null);
  const [isReportTypesChartLoading, setIsReportTypesChartLoading] = useState(true);
  const [reportTypesChartError, setReportTypesChartError] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [surveysData, reportsData, companiesData, usersData] = await Promise.all([
          api('/surveys'),
          api('/reports'),
          api('/companies'),
          isAdmin ? api('/users') : Promise.resolve({ data: [] }),
        ]);

        const allSurveys = surveysData.data || [];
        const allReports = reportsData.data || [];
        const finalStats: Partial<DashboardStats> = {
          totalCompanies: (companiesData.data || []).length,
          totalUsers: (usersData.data || []).length,
        };

        let relevantSurveys = allSurveys;
        let relevantReports = allReports;

        if (user?.role === UserRole.CLIENT && user.companyId) {
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

    if (user) {
      fetchDashboardData();
    }
  }, [isAdmin, user, api]);

  useEffect(() => {
    const fetchSurveyStatusData = async () => {
      if (!user) return;
      setIsSurveyStatusChartLoading(true);
      setSurveyStatusChartError(null);
      try {
        const result = await api('/stats/survey-statuses');
        const chartData = result.data || [];
        if (chartData.length > 0) {
          setSurveyStatusChartData({
            labels: chartData.map((d: any) => d.status.charAt(0).toUpperCase() + d.status.slice(1)),
            datasets: [{
              label: 'Survey Count',
              data: chartData.map((d: any) => d.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            }]
          });
        } else {
          setSurveyStatusChartData(null);
        }
      } catch (err: any) {
        console.error("Error fetching survey status data:", err);
        setSurveyStatusChartError(err.message || 'Failed to load survey status distribution.');
      } finally {
        setIsSurveyStatusChartLoading(false);
      }
    };

    if (user) {
      fetchSurveyStatusData();
    }
  }, [user, api]);

  useEffect(() => {
    const fetchSurveyResponsesData = async () => {
      if (!user) return;
      setIsSurveyResponsesChartLoading(true);
      setSurveyResponsesChartError(null);
      try {
        const result = await api('/stats/survey-responses');
        const chartData = result.data || [];
        if (chartData.length > 0) {
          setSurveyResponsesChartData({
            labels: chartData.map((d: any) => d.surveyTitle),
            datasets: [{
              label: 'Response Count',
              data: chartData.map((d: any) => d.responseCount),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            }]
          });
        } else {
          setSurveyResponsesChartData(null);
        }
      } catch (err: any) {
        console.error("Error fetching survey responses data:", err);
        setSurveyResponsesChartError(err.message || 'Failed to load survey responses data.');
      } finally {
        setIsSurveyResponsesChartLoading(false);
      }
    };

    if (user) {
      fetchSurveyResponsesData();
    }
  }, [user, api]);

  useEffect(() => {
    const fetchReportTypesData = async () => {
      if (!user) return;
      setIsReportTypesChartLoading(true);
      setReportTypesChartError(null);
      try {
        const result = await api('/stats/report-types');
        const chartData = result.data || [];
        if (chartData.length > 0) {
          setReportTypesChartData({
            labels: chartData.map((d: any) => d.reportType),
            datasets: [{
              label: 'Report Count',
              data: chartData.map((d: any) => d.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            }]
          });
        } else {
          setReportTypesChartData(null);
        }
      } catch (err: any) {
        console.error("Error fetching report types data:", err);
        setReportTypesChartError(err.message || 'Failed to load report types distribution.');
      } finally {
        setIsReportTypesChartLoading(false);
      }
    };

    if (user) {
      fetchReportTypesData();
    }
  }, [user, api]);

  // Combined loading state: true if this page is loading OR if auth context is still loading user
  const pageIsLoading = isLoading || (!user && !!localStorage.getItem('authToken'));


  if (pageIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const getDashboardTitle = () => {
    if (user?.role === UserRole.ADMIN) return "Admin Dashboard";
    if (user?.role === UserRole.AGENT) return "Agent Dashboard";
    if (user?.role === UserRole.CLIENT) return "Client Dashboard";
    return "Dashboard";
  };

  const isAgent = user?.role === UserRole.AGENT;

  return (
    <div className="space-y-6 animate-fade-in">
       {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {getDashboardTitle()}
        </h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {(Object.keys(stats).length > 0 || !error) && ( // Render stat cards if stats are loaded or no error stopped everything
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Surveys"
            value={stats.totalSurveys?.toString() || '0'}
            icon={<ClipboardList className="h-6 w-6 text-primary-500" />}
            // trend related props removed
          />
          <StatCard
            title="Total Responses"
            value={stats.totalResponses?.toLocaleString() || '0'}
            icon={<Users className="h-6 w-6 text-secondary-500" />}
          />
          {!isAgent && (
            <>
              <StatCard
                title="Reports Generated"
                value={stats.reportsGenerated?.toString() || '0'}
                icon={<BarChart3 className="h-6 w-6 text-accent-500" />}
              />
              <StatCard
                title="Avg. Completion Rate"
                value={`${Math.round(stats.averageCompletionRate || 0)}%`}
                icon={<TrendingUp className="h-6 w-6 text-success-500" />}
              />
              <StatCard
                title="Total Companies"
                value={stats.totalCompanies?.toString() || '0'}
                icon={<Building2 className="h-6 w-6 text-indigo-500" />}
              />
              {isAdmin && ( // Only show Total Users card if user is admin
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers?.toString() || 'N/A'}
                  icon={<UserCheck className="h-6 w-6 text-teal-500" />}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Charts and Visualizations */}
      {!isAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <DashboardCard
            title="Survey Status Distribution"
            variant="pie" // Or use a new variant if DashboardCard's icon logic is tied to it
            isLoading={isSurveyStatusChartLoading}
          >
            {surveyStatusChartError && (
              <div className="h-[300px] flex items-center justify-center p-4 text-red-500">
                <p>{surveyStatusChartError}</p>
              </div>
            )}
            {!isSurveyStatusChartLoading && !surveyStatusChartError && surveyStatusChartData && (
              <div className="h-[300px] p-4 flex justify-center items-center"> {/* Ensure chart has height */}
                <Pie
                  data={surveyStatusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false, // Title is on DashboardCard
                        text: 'Survey Statuses',
                      },
                    },
                  }}
                />
              </div>
            )}
            {!isSurveyStatusChartLoading && !surveyStatusChartError && !surveyStatusChartData && (
              <div className="h-[300px] flex items-center justify-center p-4 text-gray-500">
                  <p>No survey status data available.</p>
              </div>
            )}
          </DashboardCard>
          <DashboardCard
            title="Survey Responses"
            variant="bar"
            isLoading={isSurveyResponsesChartLoading}
          >
            {surveyResponsesChartError && (
              <div className="h-[300px] flex items-center justify-center p-4 text-red-500">
                <p>{surveyResponsesChartError}</p>
              </div>
            )}
            {!isSurveyResponsesChartLoading && !surveyResponsesChartError && surveyResponsesChartData && (
              <div className="h-[300px] p-4 flex justify-center items-center">
                <Bar
                  data={surveyResponsesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                        text: 'Survey Responses',
                      },
                    },
                  }}
                />
              </div>
            )}
            {!isSurveyResponsesChartLoading && !surveyResponsesChartError && !surveyResponsesChartData && (
              <div className="h-[300px] flex items-center justify-center p-4 text-gray-500">
                  <p>No survey response data available.</p>
              </div>
            )}
          </DashboardCard>
          <DashboardCard
            title="Report Types"
            variant="pie"
            isLoading={isReportTypesChartLoading}
          >
            {reportTypesChartError && (
              <div className="h-[300px] flex items-center justify-center p-4 text-red-500">
                <p>{reportTypesChartError}</p>
              </div>
            )}
            {!isReportTypesChartLoading && !reportTypesChartError && reportTypesChartData && (
              <div className="h-[300px] p-4 flex justify-center items-center">
                <Pie
                  data={reportTypesChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                        text: 'Report Types',
                      },
                    },
                  }}
                />
              </div>
            )}
            {!isReportTypesChartLoading && !reportTypesChartError && !reportTypesChartData && (
              <div className="h-[300px] flex items-center justify-center p-4 text-gray-500">
                  <p>No report type data available.</p>
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {/* Recent Activity */}
      {!isAgent && (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      {item % 2 === 0 ? (
                        <ClipboardList className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {item % 2 === 0
                          ? 'New survey response submitted'
                          : 'Report generated for Client'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          Date.now() - item * 3600000
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/survey-builder" className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 text-center">
          <h3 className="font-bold text-lg">Survey Builder</h3>
        </Link>
        <Link to="/advanced-analytics" className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 text-center">
          <h3 className="font-bold text-lg">Advanced Analytics & Reporting</h3>
        </Link>
        <Link to="/collaboration" className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 text-center">
          <h3 className="font-bold text-lg">Collaboration & Team Features</h3>
        </Link>
        <Link to="/market-research-tools" className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 text-center">
          <h3 className="font-bold text-lg">Market Research Tools</h3>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;