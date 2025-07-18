import React from 'react';
import Hero from '../components/layout/Hero';
import MultiSurveyAnalysis from './MultiSurveyAnalysis';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Hero />
      {user && (user.role === 'admin' || user.role === 'agent') && (
        <div className="mt-8">
          <MultiSurveyAnalysis />
        </div>
      )}
    </div>
  );
};

export default HomePage;
