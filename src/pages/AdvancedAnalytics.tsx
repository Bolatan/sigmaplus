import React from 'react';
import Layout from '../components/layout/Layout';

const AdvancedAnalyticsPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Advanced Analytics & Reporting</h1>
        <h2 className="text-2xl font-bold mb-2">Multi-Survey Analysis</h2>
        <p className="mb-4">Combine and analyze data across multiple surveys with multi-survey analysis, track key metrics over time, and consolidate findings in an interactive dashboard.</p>
        <h2 className="text-2xl font-bold mb-2">Real-time Results</h2>
        <p className="mb-4">Live data collection and analysis.</p>
        <h2 className="text-2xl font-bold mb-2">Reporting Dashboard</h2>
        <p className="mb-4">Interactive charts, graphs, and customizable reports.</p>
        <h2 className="text-2xl font-bold mb-2">Data Export</h2>
        <p className="mb-4">Export to various formats including Excel, CSV, and PDF.</p>
        <h2 className="text-2xl font-bold mb-2">AI Text Analysis</h2>
        <p>Automated sentiment analysis and text summarization.</p>
      </div>
    </Layout>
  );
};

export default AdvancedAnalyticsPage;
