import React from 'react';

const MarketResearch = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12">Market Research Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Panel Services Card */}
        <div className="card bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Panel Services</h3>
            <p className="text-gray-700 mb-6">Access to global survey panels for market research.</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>
        </div>

        {/* Demographic Analysis Card */}
        <div className="card bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Demographic Analysis</h3>
            <p className="text-gray-700 mb-6">Advanced demographic breakdowns and targeting.</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>
        </div>

        {/* Sample Reports Card */}
        <div className="card bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Sample Reports</h3>
            <p className="text-gray-700 mb-6">Preview capabilities for feature importance and price optimization studies.</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>
        </div>

        {/* Advanced Analytics Card */}
        <div className="card bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Advanced Analytics</h3>
            <p className="text-gray-700 mb-6">Gain deeper insights with predictive modeling and AI-driven analysis.</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketResearch;
