import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Grid,
  Users,
  Building2,
  Settings,
  LogOut,
  Briefcase,
  FileText,
  Search,
  Wrench,
  PieChart,
  Users2,
  AreaChart
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, end }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      <span className="mr-3 h-5 w-5">{icon}</span>
      {label}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems: NavItemProps[] = [
    { to: '/', icon: <LayoutDashboard />, label: 'Dashboard', end: true },
    { to: '/projects', icon: <Briefcase />, label: 'Projects' },
    { to: '/users', icon: <Users />, label: 'Users' },
    { to: '/companies', icon: <Building2 />, label: 'Companies' },
    { to: '/market-research', icon: <Search />, label: 'Market Research' },
    { to: '/dashboard-module', icon: <Grid />, label: 'Dashboard Module' },
    { to: '/surveys', icon: <FileText />, label: 'Surveys' },
    { to: '/reports', icon: <BarChart3 />, label: 'Reports' },
    { to: '/survey-builder', icon: <Wrench />, label: 'Survey Builder' },
    { to: '/advanced-analytics', icon: <PieChart />, label: 'Advanced Analytics' },
    { to: '/collaboration', icon: <Users2 />, label: 'Collaboration' },
    { to: '/multi-survey-dashboard', icon: <AreaChart />, label: 'Multi-Survey Analysis' },
    { to: '/settings', icon: <Settings />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-700">Signa Plus</h1>
        <p className="text-sm text-gray-500 mt-1">Marketing Research</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
      </div>

      {user && (
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name}
              className="h-8 w-8 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};