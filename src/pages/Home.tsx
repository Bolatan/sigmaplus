import React from 'react';
import Hero from '../components/layout/Hero';
import Features from '../components/layout/Features';
import MultiSurveyAnalysis from './MultiSurveyAnalysis';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Hero />
      <Features />
      {user && (user.role === 'admin' || user.role === 'agent') && (
        <div className="mt-8">
          <MultiSurveyAnalysis />
        </div>
      )}
    </div>
  );
};

export default HomePage;
