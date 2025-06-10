import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '../../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar for mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={toggleSidebar}
        ></div>
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white">
          <Sidebar />
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};