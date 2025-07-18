import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';

export const generateChart = async (chartData) => {
  const width = 400;
  const height = 400;
  const configuration = {
    type: 'bar',
    data: chartData,
    options: {},
    plugins: [],
  };
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  return buffer.toString('base64');
};
