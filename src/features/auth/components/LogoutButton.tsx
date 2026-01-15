import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface LogoutButtonProps {
  /** Button variant style */
  variant?: 'primary' | 'ghost' | 'outline';
  /** Additional CSS classes */
  className?: string;
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show icon with text */
  showIcon?: boolean;
  /** Custom button text */
  children?: React.ReactNode;
}

/**
 * Logout button component with DaisyUI styling
 * Handles logout with loading state and graceful error handling
 */
export function LogoutButton({
  variant = 'ghost',
  className = '',
  size = 'md',
  showIcon = true,
  children,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      // Errors are handled gracefully in authService
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantClass = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  }[variant];

  const sizeClass = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size];

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      aria-label="Sign out"
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <>
          {showIcon && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          )}
          {children || 'Sign Out'}
        </>
      )}
    </button>
  );
}
