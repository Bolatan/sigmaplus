import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const SurveyBuilderLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default SurveyBuilderLayout;
