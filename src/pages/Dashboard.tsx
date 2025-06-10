import React, { useState, useEffect } from 'react';
import { Users, BarChart3, ClipboardList, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { StatCard } from '../components/dashboard/StatCard';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface DashboardStats {
  totalSurveys: number;
  totalResponses: number;
  reportsGenerated: number;
  averageCompletionRate: number;
  surveyTrend: number;
  responseTrend: number;
  reportTrend: number;
  completionRateTrend: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSurveys: 0,
    totalResponses: 0,
    reportsGenerated: 0,
    averageCompletionRate: 0,
    surveyTrend: 0,
    responseTrend: 0,
    reportTrend: 0,
    completionRateTrend: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = user?.role === UserRole.ADMIN;
  const isAgent = user?.role === UserRole.AGENT;
  const isClient = user?.role === UserRole.CLIENT;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch surveys count
      const surveysResponse = await fetch(`${import.meta.env.VITE_API_URL}/surveys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const surveysData = await surveysResponse.json();
      const surveys = surveysData.data || [];

      // Calculate total responses
      const totalResponses = surveys.reduce((acc: number, survey: any) => 
        acc + (survey.responseCount || 0), 0);

      // Fetch reports count
      const reportsResponse = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const reportsData = await reportsResponse.json();
      const reports = reportsData.data || [];

      // Calculate completion rate
      const completedSurveys = surveys.filter((survey: any) => 
        survey.status === 'completed').length;
      const averageCompletionRate = surveys.length > 0 
        ? (completedSurveys / surveys.length) * 100 
        : 0;

      setStats({
        totalSurveys: surveys.length,
        totalResponses,
        reportsGenerated: reports.length,
        averageCompletionRate,
        surveyTrend: 8,
        responseTrend: 12,
        reportTrend: 5,
        completionRateTrend: -2
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep the previous stats on error
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin && "Admin Dashboard"}
          {isAgent && "Agent Dashboard"}
          {isClient && "Client Dashboard"}
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Surveys"
          value={stats.totalSurveys.toString()}
          icon={<ClipboardList className="h-6 w-6 text-primary-500" />}
          change={stats.surveyTrend}
          trend={stats.surveyTrend >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Total Responses"
          value={stats.totalResponses.toLocaleString()}
          icon={<Users className="h-6 w-6 text-secondary-500" />}
          change={stats.responseTrend}
          trend={stats.responseTrend >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Reports Generated"
          value={stats.reportsGenerated.toString()}
          icon={<BarChart3 className="h-6 w-6 text-accent-500" />}
          change={stats.reportTrend}
          trend={stats.reportTrend >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Average Completion Rate"
          value={`${Math.round(stats.averageCompletionRate)}%`}
          icon={<TrendingUp className="h-6 w-6 text-success-500" />}
          change={Math.abs(stats.completionRateTrend)}
          trend={stats.completionRateTrend >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Brand Awareness Trends"
          variant="line"
        >
          <div className="h-[300px] flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <p className="text-lg">Sample Line Chart</p>
              <p className="text-sm">Showing brand awareness over time</p>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Market Share Distribution"
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

      {/* Recent Activity */}
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
    </div>
  );
};

export default Dashboard;