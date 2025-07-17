import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import useApi from '../../hooks/useApi';
import { Card } from '../ui/Card';
import { DashboardCard } from './DashboardCard';

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

const SurveyCharts: React.FC = () => {
  const api = useApi();
  const [surveyStatusChartData, setSurveyStatusChartData] = useState<any>(null);
  const [isSurveyStatusChartLoading, setIsSurveyStatusChartLoading] = useState(true);
  const [surveyStatusChartError, setSurveyStatusChartError] = useState<string | null>(null);

  const [responsesBySurveyChartData, setResponsesBySurveyChartData] = useState<any>(null);
  const [isResponsesBySurveyChartLoading, setIsResponsesBySurveyChartLoading] = useState(true);
  const [responsesBySurveyChartError, setResponsesBySurveyChartError] = useState<string | null>(null);

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

    fetchSurveyStatusData();
    fetchResponsesBySurveyData();
  }, [api]);

  return (
    <section className="py-20">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard
                    title="Survey Status Distribution"
                    variant="pie"
                    isLoading={isSurveyStatusChartLoading}
                >
                    {surveyStatusChartError && (
                    <div className="h-[300px] flex items-center justify-center p-4 text-red-500">
                        <p>{surveyStatusChartError}</p>
                    </div>
                    )}
                    {!isSurveyStatusChartLoading && !surveyStatusChartError && surveyStatusChartData && (
                    <div className="h-[300px] p-4 flex justify-center items-center">
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
                                display: false,
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
                    title="Responses by Survey"
                    variant="bar"
                    isLoading={isResponsesBySurveyChartLoading}
                >
                    {responsesBySurveyChartError && (
                        <div className="h-[300px] flex items-center justify-center p-4 text-red-500">
                            <p>{responsesBySurveyChartError}</p>
                        </div>
                    )}
                    {!isResponsesBySurveyChartLoading && !responsesBySurveyChartError && responsesBySurveyChartData && (
                        <div className="h-[300px] p-4 flex justify-center items-center">
                            <Bar
                                data={responsesBySurveyChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top' as const,
                                        },
                                        title: {
                                            display: false,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                    {!isResponsesBySurveyChartLoading && !responsesBySurveyChartError && !responsesBySurveyChartData && (
                        <div className="h-[300px] flex items-center justify-center p-4 text-gray-500">
                            <p>No data available for responses by survey.</p>
                        </div>
                    )}
                </DashboardCard>
            </div>
        </div>
    </section>
  );
};

export default SurveyCharts;
