import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="bg-gray-100 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          SURVEYS AND FORMS BUILT FOR SUCCESS
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered surveys that engage your audience. Insights that drive growth.
        </p>
        <div className="flex justify-center space-x-4 mb-8">
          <Link to="/survey-builder" className="text-primary-500 hover:underline">Survey Builder</Link>
          <Link to="/advanced-analytics" className="text-primary-500 hover:underline">Advanced Analytics & Reporting</Link>
          <Link to="/collaboration" className="text-primary-500 hover:underline">Collaboration & Team Features</Link>
          <Link to="/market-research" className="text-primary-500 hover:underline">Market Research Tools</Link>
        </div>
        <Link
          to="/signup"
          className="bg-primary-500 text-white px-8 py-4 rounded-full font-bold hover:bg-primary-600"
        >
          Get started free
        </Link>
      </div>
    </section>
  );
};

export default Hero;
