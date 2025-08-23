import BrandAwarenessAndPerception from './brandAwarenessAndPerception.js';
import BrandUsageAndPurchaseBehavior from './brandUsageAndPurchaseBehavior.js';
import CustomerSatisfactionAndLoyalty from './customerSatisfactionAndLoyalty.js';
import ChallengesAndImprovementOpportunities from './challengesAndImprovementOpportunities.js';
import OutletDynamics from './outletDynamics.js';
import ProductStockingAndRestocking from './productStockingAndRestocking.js';
import SupplyMethodsAndBarriers from './supplyMethodsAndBarriers.js';
import TradeMarginsAndPricing from './tradeMarginsAndPricing.js';
import TradeCustomerLifecycleAndSupport from './tradeCustomerLifecycleAndSupport.js';
import DriversOfPurchase from './driversOfPurchase.js';
import MarketingChannelsAndAwarenessSources from './marketingChannelsAndAwarenessSources.js';
import CsatNpsCes from './csatNpsCes.js';
import { generateChart } from '../chartGenerator.js';

export default class CoreInsightAreas {
  constructor(dataProcessor) {
    this.dataProcessor = dataProcessor;
    this.subSections = [
      BrandUsageAndPurchaseBehavior,
      CustomerSatisfactionAndLoyalty,
      ChallengesAndImprovementOpportunities,
      OutletDynamics,
      ProductStockingAndRestocking,
      SupplyMethodsAndBarriers,
      TradeMarginsAndPricing,
      TradeCustomerLifecycleAndSupport,
      DriversOfPurchase,
      MarketingChannelsAndAwarenessSources,
      CsatNpsCes,
    ];
  }

  async generate() {
    console.log('Generating core insight areas section...');
    const processedData = this.dataProcessor.process();
    const content = this.subSections.map(SubSection => {
      // Pass the dataProcessor, not the processedData
      const instance = new SubSection(this.dataProcessor);
      return instance.generate();
    });

    const { summaryStatistics } = processedData;

    const charts = [];
    for (const questionId in summaryStatistics) {
      const chartData = {
        labels: ['Count'],
        datasets: [
          {
            label: `Question ${questionId}`,
            data: [summaryStatistics[questionId].count],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
      const chart = await generateChart(chartData);
      charts.push({
        title: `Question ${questionId}`,
        chart,
      });
    }

    return {
      title: 'Core Insight Areas',
      content: [...content, ...charts],
    };
  }
}
