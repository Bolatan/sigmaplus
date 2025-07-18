import React from 'react';
import Layout from '../components/layout/Layout';

const SurveyBuilderPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Survey Builder</h1>
        <p className="mb-4">Intuitive drag-and-drop interface with customizable templates and question types.</p>
        <h2 className="text-2xl font-bold mb-2">Question Types</h2>
        <ul className="list-disc ml-8 mb-4">
          <li>Multiple choice</li>
          <li>Star rating</li>
          <li>Ranking</li>
          <li>Matrix</li>
          <li>Open-ended</li>
        </ul>
        <h2 className="text-2xl font-bold mb-2">AI-Powered Survey Creation</h2>
        <p className="mb-4">Build with AI now supports star rating, ranking, and matrix question types, so you can create even more advanced surveys in seconds.</p>
        <h2 className="text-2xl font-bold mb-2">Logic & Branching</h2>
        <p className="mb-4">Conditional logic and skip patterns to create dynamic surveys.</p>
        <h2 className="text-2xl font-bold mb-2">Multilingual Support</h2>
        <p>Create surveys in multiple languages.</p>
      </div>
    </Layout>
  );
};

export default SurveyBuilderPage;
