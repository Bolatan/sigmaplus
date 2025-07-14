import DataProcessor from './dataProcessor.js';
// import StudyOverview from './sections/studyOverview.js';
// import RespondentProfile from './sections/respondentProfile.js';
// import ExecutiveSummary from './sections/executiveSummary.js';
import BrandAwarenessAndPerception from './sections/brandAwarenessAndPerception.js';
import BrandUsageAndPurchaseBehavior from './sections/brandUsageAndPurchaseBehavior.js';
import CustomerSatisfactionAndLoyalty from './sections/customerSatisfactionAndLoyalty.js';
import OutletDynamics from './sections/outletDynamics.js';
import ProductStockingAndRestocking from './sections/productStockingAndRestocking.js';
import SupplyMethodsAndBarriers from './sections/supplyMethodsAndBarriers.js';
import TradeMarginsAndPricing from './sections/tradeMarginsAndPricing.js';
import TradeCustomerLifecycleAndSupport from './sections/tradeCustomerLifecycleAndSupport.js';
import DriversOfPurchase from './sections/driversOfPurchase.js';
import MarketingChannelsAndAwarenessSources from './sections/marketingChannelsAndAwarenessSources.js';
import CsatNpsCes from './sections/csatNpsCes.js';
import RegionalAndOutletLevelFindings from './sections/regionalAndOutletLevelFindings.js';
// import Recommendations from './sections/recommendations.js';
import Presentation from './presentation.js';
import Exporter from './exporter.js';

export default class Reporting {
  constructor(clientData) {
    this.clientData = clientData;
  }

  async generateReport() {
    // 1. Process data
    const dataProcessor = new DataProcessor(this.clientData);
    const processedData = dataProcessor.process();

    // 2. Generate each section
    const sections = [
      // new StudyOverview(processedData).generate(),
      // new RespondentProfile(processedData).generate(),
      // new ExecutiveSummary(processedData).generate(),
      new BrandAwarenessAndPerception(processedData).generate(),
      new BrandUsageAndPurchaseBehavior(processedData).generate(),
      new CustomerSatisfactionAndLoyalty(processedData).generate(),
      new OutletDynamics(processedData).generate(),
      new ProductStockingAndRestocking(processedData).generate(),
      new SupplyMethodsAndBarriers(processedData).generate(),
      new TradeMarginsAndPricing(processedData).generate(),
      new TradeCustomerLifecycleAndSupport(processedData).generate(),
      new DriversOfPurchase(processedData).generate(),
      new MarketingChannelsAndAwarenessSources(processedData).generate(),
      new CsatNpsCes(processedData).generate(),
      new RegionalAndOutletLevelFindings(processedData).generate(),
      // new Recommendations(processedData).generate(),
    ];

    // 3. Create PowerPoint presentation
    const presentation = new Presentation({ sections }).generate();

    // Save the presentation
    await presentation.writeFile({ fileName: `${this.clientData.clientName}-report.pptx` });

    console.log("Report generated successfully.");
    return presentation;
  }
}
