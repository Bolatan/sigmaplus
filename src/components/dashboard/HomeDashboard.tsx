import React from 'react';
import { useApi } from '../../hooks/useApi';
import { Survey, Report } from '../../types';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const HomeDashboard: React.FC = () => {
  const { data: surveys, loading: surveysLoading } = useApi<Survey[]>('/surveys');
  const { data: reports, loading: reportsLoading } = useApi<Report[]>('/reports');

  if (surveysLoading || reportsLoading) {
    return <div>Loading...</div>;
  }

  const surveyData = {
    labels: surveys?.map(s => s.name),
    datasets: [
      {
        label: '# of Responses',
        data: surveys?.map(s => s.responseCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const reportData = {
    labels: reports?.map(r => r.name),
    datasets: [
      {
        label: 'Report Sections',
        data: reports?.map(r => r.sections.length),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Surveys</h2>
          {surveys && surveys.length > 0 ? <Bar data={surveyData} /> : <p>No surveys found.</p>}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Reports</h2>
          {reports && reports.length > 0 ? <Pie data={reportData} /> : <p>No reports found.</p>}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
