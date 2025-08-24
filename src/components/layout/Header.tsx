import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="text-gray-600 hover:text-gray-800">
    {children}
  </Link>
);

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SignaPlus Logo" className="h-8" />
            <span className="text-2xl font-bold text-gray-800">SignaPlus</span>
          </Link>
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/survey-builder">Survey Builder</NavLink>
            <NavLink to="/market-research">Market Research</NavLink>
            <NavLink to="/advanced-analytics">Advanced Analytics</NavLink>
            <NavLink to="/reports">Reports</NavLink>
            <NavLink to="/collaboration">Collaboration</NavLink>
            <NavLink to="/multi-survey-dashboard">Multi-Survey Analysis</NavLink>
            {user?.role === 'admin' && (
              <>
                <NavLink to="/users">Users</NavLink>
                <NavLink to="/companies">Companies</NavLink>
              </>
            )}
            <NavLink to="/settings">Settings</NavLink>
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