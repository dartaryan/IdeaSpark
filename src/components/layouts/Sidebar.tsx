import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { ROUTES } from '../../routes/routeConstants';

/**
 * Navigation item definition
 */
interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  requiredRole?: 'admin';
}

/**
 * SVG Icons for navigation
 */
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
      clipRule="evenodd"
    />
  </svg>
);

const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

/**
 * Navigation items configuration
 * Items without requiredRole are visible to all authenticated users
 * Items with requiredRole='admin' are only visible to admins
 */
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: <HomeIcon />,
  },
  {
    label: 'My Ideas',
    path: ROUTES.IDEAS,
    icon: <LightbulbIcon />,
  },
  {
    label: 'New Idea',
    path: ROUTES.NEW_IDEA,
    icon: <PlusIcon />,
  },
  {
    label: 'Admin Dashboard',
    path: ROUTES.ADMIN_DASHBOARD,
    icon: <SettingsIcon />,
    requiredRole: 'admin',
  },
  {
    label: 'Analytics',
    path: ROUTES.ADMIN_ANALYTICS,
    icon: <ChartIcon />,
    requiredRole: 'admin',
  },
];

export interface SidebarProps {
  /** Callback when a nav item is clicked (used to close mobile drawer) */
  onNavClick?: () => void;
}

/**
 * Sidebar navigation component
 * Displays navigation links filtered by user role
 * Used within DaisyUI drawer pattern
 */
export function Sidebar({ onNavClick }: SidebarProps) {
  const { user } = useAuth();

  // Filter nav items based on user role
  const filteredItems = navItems.filter((item) => {
    if (!item.requiredRole) return true;
    return user?.role === item.requiredRole;
  });

  return (
    <aside className="w-64 bg-base-100 min-h-full flex flex-col">
      {/* Logo for mobile drawer */}
      <div className="lg:hidden p-4 border-b border-base-200">
        <span className="text-xl font-bold">
          <span className="text-primary">Idea</span>
          <span>Spark</span>
        </span>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-4">
        <ul className="menu menu-lg gap-1">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onNavClick}
                className={({ isActive }) =>
                  isActive
                    ? 'active bg-primary/10 text-primary font-medium'
                    : 'hover:bg-base-200'
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User role indicator at bottom */}
      {user && (
        <div className="p-4 border-t border-base-200">
          <div className="text-xs text-base-content/60">
            Logged in as{' '}
            <span className="badge badge-sm badge-ghost capitalize">
              {user.role}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
