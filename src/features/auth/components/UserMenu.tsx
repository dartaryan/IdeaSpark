import { useAuth } from '../hooks/useAuth';
import { LogoutButton } from './LogoutButton';

export interface UserMenuProps {
  /** Additional CSS classes for the dropdown container */
  className?: string;
}

/**
 * User menu dropdown component
 * Displays user avatar with initials, email, and logout option
 */
export function UserMenu({ className = '' }: UserMenuProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Get initials from email (first letter of email)
  const initials = user.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar placeholder"
        aria-label="User menu"
        aria-haspopup="true"
      >
        <div className="bg-primary text-primary-content rounded-full w-10">
          <span className="text-lg font-semibold">{initials}</span>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        role="menu"
      >
        {/* User info header */}
        <li className="menu-title px-4 py-2">
          <div className="flex flex-col">
            <span className="font-semibold text-base-content">Account</span>
            <span className="text-xs text-base-content/60 truncate" title={user.email}>
              {user.email}
            </span>
          </div>
        </li>
        
        <li className="divider my-1"></li>
        
        {/* Profile link - not yet implemented */}
        <li>
          <a
            href="/profile"
            onClick={(e) => {
              e.preventDefault();
              // Note: Profile page navigation deferred — not in current sprint scope
            }}
            className="text-base-content/70 cursor-not-allowed"
            aria-disabled="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
            <span className="badge badge-xs badge-ghost">Soon</span>
          </a>
        </li>
        
        <li className="divider my-1"></li>
        
        {/* Logout button */}
        <li>
          <LogoutButton
            variant="ghost"
            size="sm"
            className="w-full justify-start text-error hover:bg-error/10"
            showIcon={true}
          />
        </li>
      </ul>
    </div>
  );
}
