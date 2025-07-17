import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <Link to="/" className="mr-4">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <nav className="hidden md:flex items-center text-sm font-medium">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <Link to={crumb.path} className="text-gray-500 hover:text-gray-700">
                {crumb.label}
              </Link>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
            </React.Fragment>
          ))}
        </nav>
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