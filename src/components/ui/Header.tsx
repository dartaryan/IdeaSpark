import { UserMenu } from '../../features/auth/components/UserMenu';

export interface HeaderProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Temporary header component for authenticated pages
 * Provides IdeaSpark branding and user menu access
 * Will be enhanced in Story 1.9 (Application Shell)
 */
export function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`navbar bg-base-100 shadow-sm ${className}`}>
      <div className="flex-1">
        {/* Logo and brand */}
        <a href="/dashboard" className="btn btn-ghost normal-case text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="text-primary font-bold">Idea</span>
          <span className="font-bold">Spark</span>
        </a>
      </div>
      
      <div className="flex-none gap-2">
        {/* User menu dropdown */}
        <UserMenu />
      </div>
    </header>
  );
}
