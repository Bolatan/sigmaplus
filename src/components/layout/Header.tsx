import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <a href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SignaPlus Logo" className="h-8" />
            <span className="text-2xl font-bold text-gray-800">SignaPlus</span>
          </a>
          <nav className="hidden md:flex space-x-8">

            <a href="/surveys" className="text-gray-600 hover:text-gray-800">
              Surveys
            </a>
            <a href="/reports" className="text-gray-600 hover:text-gray-800">
              Reports
            </a>
            <a href="/survey-builder" className="text-gray-600 hover:text-gray-800">
              Survey Builder

            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Templates
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Pricing
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Enterprise
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              Resources
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/login" className="text-gray-600 hover:text-gray-800">
            Log in
          </a>
          <a
            href="/signup"
            className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
          >
            Sign up free
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;