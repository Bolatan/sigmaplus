import React from 'react';
import { Users, BarChart3, ClipboardList, TrendingUp, Building2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
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
  const { user } = useAuth();
  const { stats, isLoading, error } = useDashboardStats();

  const getDashboardTitle = () => {
    if (user?.role === UserRole.ADMIN) return "Admin Dashboard";
    if (user?.role === UserRole.AGENT) return "Agent Dashboard";
    if (user?.role === UserRole.CLIENT) return "Client Dashboard";
    return "Dashboard";
  };

  const isAgent = user?.role === UserRole.AGENT;
  const isAdmin = user?.role === UserRole.ADMIN;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  const surveyStatusChartData = {
    labels: stats.surveyStatusDistribution?.map((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1)),
    datasets: [{
      label: 'Survey Count',
      data: stats.surveyStatusDistribution?.map((d) => d.count),
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
  };

  const responsesBySurveyChartData = {
    labels: stats.responsesBySurvey?.map((d) => d.title),
    datasets: [{
      label: 'Number of Responses',
      data: stats.responsesBySurvey?.map((d) => d.responseCount),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Surveys"
          value={stats.totalSurveys?.toString() || '0'}
          icon={<ClipboardList className="h-6 w-6 text-primary-500" />}
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
            {isAdmin && (
              <StatCard
                title="Total Users"
                value={stats.totalUsers?.toString() || 'N/A'}
                icon={<UserCheck className="h-6 w-6 text-teal-500" />}
              />
            )}
          </>
        )}
      </div>



      {/* Recent Activity - Placeholder */}
      {!isAgent && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Recent activity feed coming soon.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
