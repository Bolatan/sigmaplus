import React, { useState, useEffect } from 'react';
import { Users, BarChart3, ClipboardList, TrendingUp, Building2, UserCheck, PieChart as PieChartIcon } from 'lucide-react'; // Added PieChartIcon
import { Card, CardContent } from '../components/ui/Card';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { StatCard } from '../components/dashboard/StatCard';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

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
  const { user } = useAuth(); // Contains user role
  const [stats, setStats] = useState<Partial<DashboardStats>>({ // Partial because users might be undefined
    totalSurveys: 0,
    totalResponses: 0,
    reportsGenerated: 0,
    averageCompletionRate: 0,
    totalCompanies: 0,
    // surveyTrend: 0,
    // responseTrend: 0,
    // reportTrend: 0,
    // completionRateTrend: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;
  // const isAgent = user?.role === UserRole.AGENT; // Available for role-specific dashboard views
  // const isClient = user?.role === UserRole.CLIENT; // Available for role-specific dashboard views

  // State for survey status chart
  const [surveyStatusChartData, setSurveyStatusChartData] = useState<any>(null);
  const [isSurveyStatusChartLoading, setIsSurveyStatusChartLoading] = useState(true);
  const [surveyStatusChartError, setSurveyStatusChartError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true); // For overall page stats
      setIsSurveyStatusChartLoading(true); // For chart
      setError(null);
      setSurveyStatusChartError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        const authError = 'Authentication token not found. Please log in.';
        setError(authError);
        setSurveyStatusChartError(authError);
        setIsLoading(false);
        setIsSurveyStatusChartLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // For main stats
      let finalStats: Partial<DashboardStats> = {
        totalSurveys: 0,
        totalResponses: 0,
        reportsGenerated: 0,
        averageCompletionRate: 0,
        totalCompanies: 0, // This will be fetched globally
      };

      try {
        // Fetch all data first
        const surveysResponse = await fetch('/api/surveys', { headers });
        if (!surveysResponse.ok) throw new Error(`Surveys: ${surveysResponse.statusText}`);
        let allSurveys = (await surveysResponse.json()).data || [];

        const reportsResponse = await fetch('/api/reports', { headers });
        if (!reportsResponse.ok) throw new Error(`Reports: ${reportsResponse.statusText}`);
        let allReports = (await reportsResponse.json()).data || [];

        const companiesResponse = await fetch('/api/companies', { headers });
        if (!companiesResponse.ok) throw new Error(`Companies: ${companiesResponse.statusText}`);
        finalStats.totalCompanies = ((await companiesResponse.json()).data || []).length;

        if (isAdmin) {
          const usersResponse = await fetch('/api/users', { headers });
          if (!usersResponse.ok) throw new Error(`Users: ${usersResponse.statusText}`);
          finalStats.totalUsers = ((await usersResponse.json()).data || []).length;
        }

        // Filter for clients
        let relevantSurveys = allSurveys;
        let relevantReports = allReports;

        if (user?.role === UserRole.CLIENT && user.companyId) {
          const clientCompanyId = user.companyId.toString(); // Ensure comparison with string
          relevantSurveys = allSurveys.filter((s: any) => s.companyId && s.companyId.toString() === clientCompanyId);
          relevantReports = allReports.filter((r: any) => r.companyId && r.companyId.toString() === clientCompanyId);
          // Note: Reports need companyId field for this to work.
        }

        // Calculate stats based on relevant (possibly filtered) data
        finalStats.totalSurveys = relevantSurveys.length;
        finalStats.totalResponses = relevantSurveys.reduce((acc: number, survey: any) => acc + (survey.responseCount || 0), 0);
        const completedSurveys = relevantSurveys.filter((survey: any) => survey.status === 'completed').length;
        finalStats.averageCompletionRate = relevantSurveys.length > 0 ? (completedSurveys / relevantSurveys.length) * 100 : 0;
        finalStats.reportsGenerated = relevantReports.length;

        setStats(finalStats);

      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to load some dashboard data.');
        // Set stats with what might have been fetched before error, or keep defaults
        // but ensure client-specific data is not shown if filtering failed partially
        setStats(prevStats => ({
            ...prevStats, // keep any global stats like totalCompanies if fetched
            totalSurveys: (user?.role === UserRole.CLIENT && user.companyId) ? 0 : prevStats.totalSurveys, // Reset client specific if error
            totalResponses: (user?.role === UserRole.CLIENT && user.companyId) ? 0 : prevStats.totalResponses,
            reportsGenerated: (user?.role === UserRole.CLIENT && user.companyId) ? 0 : prevStats.reportsGenerated,
            averageCompletionRate: (user?.role === UserRole.CLIENT && user.companyId) ? 0 : prevStats.averageCompletionRate,
         }));
      } finally {
        setIsLoading(false);
      }
    };

    if (user) { // Only fetch if user is loaded (to ensure role is available for isAdmin check)
        fetchDashboardData(); // Corrected function name
    } else if (!localStorage.getItem('authToken')) { // If no token at all, probably not logged in
        setIsLoading(false);
        setError('Please log in to view the dashboard.');
    }
    // If there's a token but user isn't loaded yet from AuthContext, useEffect in AuthContext will handle it.
    // The isLoading from AuthContext can also be used here for a more global loading state.
  }, [isAdmin, user]); // Depend on user to ensure role is available and re-fetch if user changes.

  useEffect(() => {
    const fetchSurveyStatusData = async () => {
      // This fetch is independent of the main dashboard stats, so it runs in its own useEffect.
      // It depends on the user being available to get the token.
      if (!user) return;

      setIsSurveyStatusChartLoading(true);
      setSurveyStatusChartError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setSurveyStatusChartError('Authentication token not found.');
        setIsSurveyStatusChartLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/stats/survey-statuses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch chart data: ${response.statusText}`);
        }
        const result = await response.json();
        const chartData = result.data || [];

        if (chartData.length > 0) {
          setSurveyStatusChartData({
            labels: chartData.map((d: any) => d.status.charAt(0).toUpperCase() + d.status.slice(1)), // Capitalize status
            datasets: [{
              label: 'Survey Count',
              data: chartData.map((d: any) => d.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)', // Draft
                'rgba(54, 162, 235, 0.6)', // Active
                'rgba(75, 192, 192, 0.6)', // Completed
                'rgba(255, 206, 86, 0.6)', // Archived/Other
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
          setSurveyStatusChartData(null); // No data to show
        }

      } catch (err: any) {
        console.error("Error fetching survey status data:", err);
        setSurveyStatusChartError(err.message || 'Failed to load survey status distribution.');
      } finally {
        setIsSurveyStatusChartLoading(false);
      }
    };

    fetchSurveyStatusData();
  }, [user]); // Re-run if the user object changes.

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
            title="Market Share Distribution (Placeholder)"
            variant="pie"
          >
            <div className="h-[300px] flex items-center justify-center p-4">
              <div className="text-center text-gray-500">
                <p className="text-lg">Sample Pie Chart</p>
                <p className="text-sm">Showing market share by brand</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Customer Satisfaction Score"
            variant="bar"
          >
            <div className="h-[300px] flex items-center justify-center p-4">
              <div className="text-center text-gray-500">
                <p className="text-lg">Sample Bar Chart</p>
                <p className="text-sm">Showing CSAT scores by product category</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Regional Performance"
            variant="heatmap"
          >
            <div className="h-[300px] flex items-center justify-center p-4">
              <div className="text-center text-gray-500">
                <p className="text-lg">Sample Heatmap</p>
                <p className="text-sm">Showing brand performance by region</p>
              </div>
            </div>
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
    </div>
  );
};

export default Dashboard;