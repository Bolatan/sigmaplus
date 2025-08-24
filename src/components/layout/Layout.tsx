import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  show_header?: boolean;
  show_footer?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, show_header = true, show_footer = true }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {show_header && <Header />}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      {show_footer && <Footer />}
    </div>
  );
};

export default Layout;