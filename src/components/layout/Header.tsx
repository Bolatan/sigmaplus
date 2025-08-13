import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <a href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SignaPlus Logo" className="h-8" />
            <span className="text-2xl font-bold text-gray-800">SignaPlus</span>
          </a>
          {/*
            The following navigation links are placeholders for features inspired by SurveyMonkey.
            The actual pages and functionality for these links have not yet been implemented.
          */}
          <nav className="hidden md:flex space-x-4">
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">Dashboard</Link>
                <Link to="/surveys" className="text-gray-600 hover:text-gray-800">Surveys</Link>
                <Link to="/projects" className="text-gray-600 hover:text-gray-800">Projects</Link>
                <Link to="/reports" className="text-gray-600 hover:text-gray-800">Reports</Link>
                <Link to="/market-research" className="text-gray-600 hover:text-gray-800">Market Research</Link>
                <Link to="/survey-builder" className="text-gray-600 hover:text-gray-800">Survey Builder</Link>
                <Link to="/advanced-analytics" className="text-gray-600 hover:text-gray-800">Advanced Analytics</Link>
                <Link to="/collaboration" className="text-gray-600 hover:text-gray-800">Collaboration</Link>
                <Link to="/multi-survey-dashboard" className="text-gray-600 hover:text-gray-800">Multi-Survey Analysis</Link>
                <Link to="/settings" className="text-gray-600 hover:text-gray-800">Settings</Link>
                {user?.role === 'admin' && (
                  <>
                    <Link to="/users" className="text-gray-600 hover:text-gray-800">Users</Link>
                    <Link to="/companies" className="text-gray-600 hover:text-gray-800">Companies</Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <a
              href="/logout"
              className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
            >
              Log out
            </a>
          ) : (
            <>
              <a href="/login" className="text-gray-600 hover:text-gray-800">
                Log in
              </a>
              <a
                href="/signup"
                className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
              >
                Sign up free
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;