import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

interface ChartCardProps {
  title: string;
  chartType: 'pie' | 'bar';
  chartData: any;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, chartType, chartData }) => {
  const options = {
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
  };

  const renderChart = () => {
    if (!chartData || !chartData.datasets || chartData.datasets.every((ds: any) => !ds.data || ds.data.length === 0)) {
        return <div className="h-[300px] flex items-center justify-center p-4 text-gray-500"><p>No data available.</p></div>;
    }
    switch (chartType) {
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] p-4 flex justify-center items-center">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
