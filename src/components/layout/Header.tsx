import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <a href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SignaPlus Logo" className="h-8" />
            <span className="text-2xl font-bold text-gray-800">SignaPlus</span>
          </a>
          <nav className="hidden md:flex space-x-8">
            {/* All navigation links have been removed as per user request. */}
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