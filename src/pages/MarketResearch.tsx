import React, { useState } from 'react';
import useApi from '../hooks/useApi';
import Layout from '../components/layout/Layout';

const MarketResearchPage: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiFetch = useApi();

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/market-research');
      setMarketData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Market Research</h1>
        <p className="mt-4 text-lg">This module provides market research tools and data.</p>

        <div className="mt-8">
          <button
            onClick={handleFetchData}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Loading...' : 'Get Market Research Data'}
          </button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-100 text-red-700 rounded">
            <p>Error: {error}</p>
          </div>
        )}

        {marketData && (
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h2 className="text-2xl font-bold">Market Research Data</h2>
            <pre className="mt-4 whitespace-pre-wrap">{JSON.stringify(marketData, null, 2)}</pre>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MarketResearchPage;
