import chartGenerator from '../chartGenerator.js';

export default class OutletDynamics {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.processedData = dataProcessor.process();
    this.chartGenerator = new chartGenerator();
  }

  async generate() {
    console.log('Generating outlet dynamics section...');

    const demographicsProfile = this.processedData.demographicsProfile;

    const outletTypeData = demographicsProfile.outletType || {};
    const regionData = demographicsProfile.region || {};

    const content = [
      {
        title: 'Performance by Outlet Type',
        content: 'This chart shows the distribution of responses by outlet type.',
        chart: await this.chartGenerator.generateChart({
          type: 'pie',
          data: {
            labels: Object.keys(outletTypeData),
            datasets: [{
              label: 'Responses by Outlet Type',
              data: Object.values(outletTypeData),
            }]
          }
        }),
      },
      {
        title: 'Regional Performance',
        content: 'This chart shows the distribution of responses by region.',
        chart: await this.chartGenerator.generateChart({
          type: 'bar',
          data: {
            labels: Object.keys(regionData),
            datasets: [{
              label: 'Responses by Region',
              data: Object.values(regionData),
            }]
          }
        }),
      },
    ];

    return {
      title: 'Outlet Dynamics',
      content,
    };
  }
}
