import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Users, 
  Building2, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { cn } from '../../utils/cn';

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
  const { user, logout } = useAuth();

  const navItems = React.useMemo(() => {
    // Common nav items for all roles
    const items: NavItemProps[] = [
      {
        to: '/',
        icon: <LayoutDashboard />,
        label: 'Dashboard',
        end: true,
      },
    ];

    // Role-specific nav items
    if (user?.role === UserRole.ADMIN) {
      items.push(
        {
          to: '/surveys',
          icon: <ClipboardList />,
          label: 'Surveys',
        },
        {
          to: '/reports',
          icon: <BarChart3 />,
          label: 'Reports',
        },
        {
          to: '/users',
          icon: <Users />,
          label: 'Users',
        },
        {
          to: '/companies',
          icon: <Building2 />,
          label: 'Companies',
        },
        {
          to: '/settings',
          icon: <Settings />,
          label: 'Settings',
        }
      );
    } else if (user?.role === UserRole.AGENT) {
      items.push(
        {
          to: '/surveys',
          icon: <ClipboardList />,
          label: 'Surveys',
        },
        {
          to: '/reports',
          icon: <BarChart3 />,
          label: 'Reports',
        }
      );
    } else if (user?.role === UserRole.CLIENT) {
      items.push(
        {
          to: '/reports',
          icon: <BarChart3 />,
          label: 'Reports',
        },
        {
          to: '/settings',
          icon: <Settings />,
          label: 'Account',
        }
      );
    }

    return items;
  }, [user?.role]);

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
          <div className="flex items-center mb-4">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name}
              className="h-8 w-8 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};