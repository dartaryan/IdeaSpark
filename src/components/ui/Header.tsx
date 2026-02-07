import { Link } from 'react-router-dom';
import { UserMenu } from '../../features/auth/components/UserMenu';
import { ROUTES } from '../../routes/routeConstants';

export interface HeaderProps {
  /** Additional CSS classes */
  className?: string;
  /** Callback when hamburger menu is clicked (for mobile drawer) */
  onMenuClick?: () => void;
}

/**
 * Header component for authenticated pages
 * Provides IdeaSpark branding, hamburger menu for mobile, and user menu
 */
export function Header({ className = '', onMenuClick }: HeaderProps) {
  return (
    <header className={`navbar bg-base-100 shadow-sm sticky top-0 z-30 ${className}`}>
      {/* Mobile hamburger menu button */}
      <div className="flex-none lg:hidden">
        <button
          type="button"
          className="btn btn-square btn-ghost"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Logo and brand */}
      <div className="flex-1">
        <Link
          to={ROUTES.DASHBOARD}
          className="btn btn-ghost normal-case text-xl"
        >
          <img
            src="/logo-text-side.svg"
            alt="IdeaSpark"
            className="h-8"
          />
        </Link>
      </div>

      {/* User menu dropdown */}
      <div className="flex-none gap-2">
        <UserMenu />
      </div>
    </header>
  );
}
