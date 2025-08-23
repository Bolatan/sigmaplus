import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const SurveyBuilderLayout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow">
        <main className="flex-grow p-8">
          {children}
        </main>
        {sidebar && (
          <aside className="w-1/4 p-8 bg-gray-50 border-l">
            {sidebar}
          </aside>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SurveyBuilderLayout;
