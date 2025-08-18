import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import useApi from '../hooks/useApi';
import { AlertTriangle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const DashboardModule: React.FC = () => {
  const api = useApi();

  const [surveyStatusChartData, setSurveyStatusChartData] = useState<any>(null);
  const [isSurveyStatusChartLoading, setIsSurveyStatusChartLoading] = useState(true);
  const [surveyStatusChartError, setSurveyStatusChartError] = useState<string | null>(null);

  const [responsesBySurveyChartData, setResponsesBySurveyChartData] = useState<any>(null);
  const [isResponsesBySurveyChartLoading, setIsResponsesBySurveyChartLoading] = useState(true);
  const [responsesBySurveyChartError, setResponsesBySurveyChartError] = useState<string | null>(null);

  // Placeholder states for new charts
  const [responseRateChartData, setResponseRateChartData] = useState<any>(null);
  const [isResponseRateChartLoading, setIsResponseRateChartLoading] = useState(true);
  const [responseRateChartError, setResponseRateChartError] = useState<string | null>(null);

  const [completionFunnelChartData, setCompletionFunnelChartData] = useState<any>(null);
  const [isCompletionFunnelChartLoading, setIsCompletionFunnelChartLoading] = useState(true);
  const [completionFunnelChartError, setCompletionFunnelChartError] = useState<string | null>(null);


  useEffect(() => {
    const fetchSurveyStatusData = async () => {
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

      const fetchResponsesBySurveyData = async () => {
          setIsResponsesBySurveyChartLoading(true);
          setResponsesBySurveyChartError(null);
          try {
            const result = await api('/stats/responses-by-survey');
            const chartData = result.data || [];
            if (chartData.length > 0) {
              setResponsesBySurveyChartData({
                labels: chartData.map((d: any) => d.title),
                datasets: [{
                  label: 'Number of Responses',
                  data: chartData.map((d: any) => d.responseCount),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                }]
              });
            } else {
              setResponsesBySurveyChartData(null);
            }
          } catch (err: any) {
            console.error("Error fetching responses by survey data:", err);
            setResponsesBySurveyChartError(err.message || 'Failed to load responses by survey.');
          } finally {
            setIsResponsesBySurveyChartLoading(false);
          }
        };

    // Mock fetching data for new charts
    const fetchNewChartData = () => {
        setIsResponseRateChartLoading(false);
        setResponseRateChartData({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
              {
                label: 'Response Rate',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
              },
            ],
          });

        setIsCompletionFunnelChartLoading(false);
        setCompletionFunnelChartData({
            labels: ['Sent', 'Opened', 'Clicked', 'Completed'],
            datasets: [{
                label: 'Survey Funnel',
                data: [5000, 2500, 1200, 600],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                  ],
            }]
        });
    }

    fetchSurveyStatusData();
    fetchResponsesBySurveyData();
    fetchNewChartData();
  }, [api]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Welcome to your new dashboard.</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder Stat Cards */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Surveys</h3>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Responses</h3>
          <p className="text-2xl font-bold">56,789</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Completion Rate</h3>
          <p className="text-2xl font-bold">85%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Active Issues</h3>
          <p className="text-2xl font-bold text-red-500 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2" />3
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DashboardCard title="Survey Status Distribution" variant="pie" isLoading={isSurveyStatusChartLoading}>
          {surveyStatusChartError ? <p className="text-red-500 p-4">{surveyStatusChartError}</p> :
           surveyStatusChartData ? <div className="h-64 p-4 flex justify-center items-center"><Pie data={surveyStatusChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div> :
           <p className="text-gray-500 p-4">No data available.</p>}
        </DashboardCard>
        <DashboardCard title="Responses by Survey" variant="bar" isLoading={isResponsesBySurveyChartLoading}>
          {responsesBySurveyChartError ? <p className="text-red-500 p-4">{responsesBySurveyChartError}</p> :
           responsesBySurveyChartData ? <div className="h-64 p-4 flex justify-center items-center"><Bar data={responsesBySurveyChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div> :
           <p className="text-gray-500 p-4">No data available.</p>}
        </DashboardCard>
        <DashboardCard title="Response Rate Over Time" variant="line" isLoading={isResponseRateChartLoading}>
            {responseRateChartError ? <p className="text-red-500 p-4">{responseRateChartError}</p> :
            responseRateChartData ? <div className="h-64 p-4 flex justify-center items-center"><Line data={responseRateChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div> :
            <p className="text-gray-500 p-4">No data available.</p>}
        </DashboardCard>
        <DashboardCard title="Survey Completion Funnel" variant="bar" isLoading={isCompletionFunnelChartLoading}>
            {completionFunnelChartError ? <p className="text-red-500 p-4">{completionFunnelChartError}</p> :
            completionFunnelChartData ? <div className="h-64 p-4 flex justify-center items-center"><Bar data={completionFunnelChartData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y' }} /></div> :
            <p className="text-gray-500 p-4">No data available.</p>}
        </DashboardCard>
      </div>
    </div>
  );
};

export default DashboardModule;
