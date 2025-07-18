
import React from 'react';
import Hero from '../components/layout/Hero';
import MultiSurveyDashboard from './MultiSurveyDashboard';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Hero />
      {user && (user.role === 'admin' || user.role === 'agent') && (
        <div className="mt-8">
          <MultiSurveyDashboard />
        </div>
      )}
    </div>
  );
};

export default HomePage;
