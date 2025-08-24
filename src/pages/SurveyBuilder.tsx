import React from 'react';
import SurveyBuilderLayout from '../components/layout/SurveyBuilderLayout';

const SurveyBuilderPage: React.FC = () => {
  return (
    <SurveyBuilderLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Survey Builder</h1>
        <p className="mt-4 text-lg">This is the placeholder page for the Survey Builder.</p>
      </div>
    </SurveyBuilderLayout>
  );
};

export default SurveyBuilderPage;
