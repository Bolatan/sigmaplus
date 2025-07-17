import React from 'react';

const MarketResearch = () => {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Market Research</h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Global Survey Panels</h3>
        <p>Access our global network of survey respondents to get insights from your target audience.</p>
        <button className="btn-primary mt-2">Access Panels</button>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Demographic Analysis</h3>
        <p>Get detailed breakdowns of your survey data by age, gender, location, and more.</p>
        <button className="btn-primary mt-2">Analyze Demographics</button>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Sample Reports</h3>
        <p>Preview reports for feature importance and price optimization studies.</p>
        <button className="btn-primary mt-2">View Sample Reports</button>
      </div>
    </div>
  );
};

export default MarketResearch;
