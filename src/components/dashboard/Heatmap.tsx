import React from 'react';
import { Bar } from 'react-chartjs-2';

interface HeatmapProps {
  data: any;
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  return <Bar data={data} />;
};

export default Heatmap;
