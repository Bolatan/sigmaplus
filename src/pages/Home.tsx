import React from 'react';
import Hero from '../components/layout/Hero';
import MultiSurveyDashboard from './MultiSurveyDashboard';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <div className="mt-8">
        <MultiSurveyDashboard />
      </div>
    </div>
  );
};

export default HomePage;
