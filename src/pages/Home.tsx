import React from 'react';
import Hero from '../components/layout/Hero';
import Layout from '../components/layout/Layout';
import HomeDashboard from '../components/dashboard/HomeDashboard';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <HomeDashboard />
    </Layout>
  );
};

export default HomePage;
