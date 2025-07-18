import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';

export default class ChartGenerator {
  constructor() {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 400, height: 400 });
  }

  async generateChart(chartData) {
    const configuration = {
      type: 'bar',
      data: chartData,
      options: {},
      plugins: [],
    };
    const buffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    return buffer.toString('base64');
  }
}
