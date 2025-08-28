import React from 'react';
import { Link } from 'react-router-dom';
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="text-gray-600 hover:text-gray-800">
    {children}
  </Link>
);

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SignaPlus Logo" className="h-8" />
            <span className="text-2xl font-bold text-gray-800">SignaPlus</span>
          </Link>
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/survey-builder">Survey Builder</NavLink>
            <NavLink to="/advanced-analytics">Advanced Analytics</NavLink>
            <NavLink to="/reports">Reports</NavLink>
            <NavLink to="/multi-survey-dashboard">Multi-Survey Analysis</NavLink>
            <NavLink to="/market-research">Market Research</NavLink>
            <NavLink to="/users">Users</NavLink>
            <NavLink to="/companies">Companies</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;