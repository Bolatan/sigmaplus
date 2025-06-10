import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    return path.charAt(1).toUpperCase() + path.slice(2).replace(/\//g, ' › ');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-primary-600 rounded-full"></span>
        </Button>
        
        {user && (
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:inline">
              {user.name}
            </span>
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name}
              className="h-8 w-8 rounded-full"
            />
          </div>
        )}
      </div>
    </header>
  );
};