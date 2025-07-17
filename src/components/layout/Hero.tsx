import React from 'react';

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
        <a
          href="/signup"
          className="bg-primary-500 text-white px-8 py-4 rounded-full font-bold hover:bg-primary-600"
        >
          Get started free
        </a>
      </div>
    </section>
  );
};

export default Hero;
