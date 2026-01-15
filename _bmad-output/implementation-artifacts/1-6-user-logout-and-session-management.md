# Story 1.6: User Logout and Session Management

Status: ready-for-dev

## Story

As a **logged-in user**,
I want **to log out of the application**,
So that **my account is secure when I'm done**.

## Acceptance Criteria

1. **Given** I am logged in **When** I click the logout button **Then** my session is terminated **And** I am redirected to the login page **And** I cannot access protected pages without logging in again

2. **Given** my session token expires **When** I try to access a protected page **Then** I am redirected to the login page **And** I see a message indicating my session expired

3. The logout button is accessible from any authenticated page (header/user menu)
4. Logout operation completes within 500ms
5. All local state is cleared on logout (Zustand stores, React Query cache)
6. Session expiry detection runs automatically in the background
7. Graceful handling of network errors during logout (still clear local state)

## Tasks / Subtasks

- [ ] Task 1: Extend authService with logout functionality (AC: 1, 7)
  - [ ] Add `signOut()` method to `src/features/auth/services/authService.ts`
  - [ ] Use Supabase Auth `signOut()` method
  - [ ] Return `ServiceResponse<void>` type
  - [ ] Handle errors gracefully (still clear session on network errors)

- [ ] Task 2: Extend useAuth hook with logout capability (AC: 1, 4, 5)
  - [ ] Add `logout()` function to `src/features/auth/hooks/useAuth.ts`
  - [ ] Clear React Query cache on logout
  - [ ] Redirect to login page on successful logout
  - [ ] Export logout function from hook

- [ ] Task 3: Create useSession hook for session monitoring (AC: 2, 6)
  - [ ] Create `src/features/auth/hooks/useSession.ts`
  - [ ] Monitor Supabase `onAuthStateChange` for token expiry events
  - [ ] Detect `TOKEN_REFRESHED`, `SIGNED_OUT`, and `USER_DELETED` events
  - [ ] Set session expired flag when appropriate
  - [ ] Provide `sessionExpired` state to consuming components

- [ ] Task 4: Create LogoutButton component (AC: 1, 3, 4)
  - [ ] Create `src/features/auth/components/LogoutButton.tsx`
  - [ ] Use DaisyUI button styling
  - [ ] Show loading state during logout
  - [ ] Call useAuth's logout function on click
  - [ ] Style appropriately for header placement

- [ ] Task 5: Create UserMenu component for header (AC: 3)
  - [ ] Create `src/features/auth/components/UserMenu.tsx`
  - [ ] Display user email or avatar placeholder
  - [ ] Include dropdown with logout option
  - [ ] Use DaisyUI dropdown component
  - [ ] Accessible keyboard navigation

- [ ] Task 6: Create temporary header layout for logout access (AC: 3)
  - [ ] Create `src/components/ui/Header.tsx` (placeholder until Story 1.9)
  - [ ] Include UserMenu component
  - [ ] Basic PassportCard branding
  - [ ] This is a minimal placeholder - full implementation in Story 1.9

- [ ] Task 7: Handle session expiry in useAuth (AC: 2)
  - [ ] Detect session expiry via `onAuthStateChange` event `SIGNED_OUT`
  - [ ] Check if expiry was due to token failure vs. user action
  - [ ] Set `sessionExpired` state flag when token expires
  - [ ] Clear local state on session expiry

- [ ] Task 8: Create SessionExpiredHandler component (AC: 2)
  - [ ] Create `src/features/auth/components/SessionExpiredHandler.tsx`
  - [ ] Listen to session expired state
  - [ ] Show toast notification "Your session has expired. Please log in again."
  - [ ] Redirect to login page with `?expired=true` query param
  - [ ] LoginPage displays expiry message when param present

- [ ] Task 9: Update LoginPage to show session expiry message (AC: 2)
  - [ ] Check for `?expired=true` query parameter
  - [ ] Display info alert when session was expired
  - [ ] Clear the query param after showing message

- [ ] Task 10: Update App.tsx with session handling (AC: 2, 6)
  - [ ] Wrap authenticated routes with SessionExpiredHandler
  - [ ] Ensure session monitoring is active
  - [ ] Add Header component to authenticated layout

- [ ] Task 11: Update barrel exports (AC: N/A)
  - [ ] Export LogoutButton from `src/features/auth/index.ts`
  - [ ] Export UserMenu from `src/features/auth/index.ts`
  - [ ] Export useSession hook
  - [ ] Export SessionExpiredHandler component

- [ ] Task 12: Test logout and session management (AC: 1-7)
  - [ ] Test logout button terminates session
  - [ ] Test redirect to login page after logout
  - [ ] Test cannot access protected pages after logout
  - [ ] Test logout works even with network issues (clears local state)
  - [ ] Test session expiry redirects to login with message
  - [ ] Test session expiry clears all state
  - [ ] Test logout is accessible from any authenticated page

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure (Extending from Stories 1.4 & 1.5):**
```
src/features/auth/
├── components/
│   ├── RegisterForm.tsx        (Story 1.4 - EXISTING)
│   ├── LoginForm.tsx           (Story 1.5 - EXISTING)
│   ├── LogoutButton.tsx        (NEW)
│   ├── UserMenu.tsx            (NEW)
│   ├── SessionExpiredHandler.tsx (NEW)
│   ├── PasswordResetForm.tsx   (Story 1.7)
│   └── AuthGuard.tsx           (Story 1.8)
├── hooks/
│   ├── useAuth.ts              (UPDATE - add logout)
│   ├── useRegister.ts          (Story 1.4 - EXISTING)
│   ├── useLogin.ts             (Story 1.5 - EXISTING)
│   └── useSession.ts           (NEW)
├── pages/
│   ├── RegisterPage.tsx        (Story 1.4 - EXISTING)
│   └── LoginPage.tsx           (UPDATE - session expired message)
├── services/
│   └── authService.ts          (UPDATE - add signOut method)
├── schemas/
│   └── authSchemas.ts          (EXISTING)
├── types.ts                    (UPDATE - add session types)
└── index.ts                    (UPDATE barrel exports)
```

### Auth Service Extension (src/features/auth/services/authService.ts)

Add the signOut method to the existing authService:

```typescript
export const authService = {
  // ... existing register and login methods from Stories 1.4 & 1.5

  async signOut(): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        // Still return success - local session should be cleared
        // even if server-side signout fails
        return {
          data: null,
          error: { message: error.message, code: 'AUTH_SIGNOUT_ERROR' },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Unexpected logout error:', error);
      // Return success anyway - we want to clear local state
      // regardless of network issues
      return { data: null, error: null };
    }
  },

  // ... existing getCurrentUser method
};
```

### useAuth Hook Extension (src/features/auth/hooks/useAuth.ts)

Update to include logout functionality and session expiry detection:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  sessionExpired: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    sessionExpired: false,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authService.getCurrentUser().then((result) => {
          setState({
            user: result.data,
            isLoading: false,
            sessionExpired: false,
          });
        });
      } else {
        setState({ user: null, isLoading: false, sessionExpired: false });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const result = await authService.getCurrentUser();
          setState({
            user: result.data,
            isLoading: false,
            sessionExpired: false,
          });
        } else if (event === 'SIGNED_OUT') {
          // Check if this was due to token expiry vs user action
          // If sessionExpired was not already set, this is user-initiated logout
          setState((prev) => ({
            user: null,
            isLoading: false,
            sessionExpired: prev.sessionExpired, // Preserve if already set
          }));
          // Clear React Query cache
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED') {
          // Session was successfully refreshed
          setState((prev) => ({ ...prev, sessionExpired: false }));
        } else if (event === 'USER_DELETED') {
          setState({ user: null, isLoading: false, sessionExpired: false });
          queryClient.clear();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    // Clear React Query cache immediately
    queryClient.clear();
    
    // Call signOut - we don't care if it fails, local state is cleared
    await authService.signOut();
    
    // Clear local state
    setState({ user: null, isLoading: false, sessionExpired: false });
    
    // Navigate to login
    navigate('/login');
  }, [navigate, queryClient]);

  const setSessionExpired = useCallback(() => {
    setState((prev) => ({ ...prev, sessionExpired: true, user: null }));
    queryClient.clear();
  }, [queryClient]);

  const clearSessionExpired = useCallback(() => {
    setState((prev) => ({ ...prev, sessionExpired: false }));
  }, []);

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    sessionExpired: state.sessionExpired,
    logout,
    setSessionExpired,
    clearSessionExpired,
  };
}
```

### useSession Hook (src/features/auth/hooks/useSession.ts)

Dedicated hook for session monitoring:

```typescript
import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from './useAuth';

export function useSession() {
  const { setSessionExpired, isAuthenticated } = useAuth();
  const lastRefreshTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          lastRefreshTime.current = Date.now();
        }

        // Detect session expiry scenarios
        if (event === 'SIGNED_OUT' && !session) {
          // Check if this was automatic (token expired) vs user action
          // If it happens without a recent user action, it's likely expiry
          const timeSinceLastRefresh = Date.now() - lastRefreshTime.current;
          const likelyExpired = timeSinceLastRefresh > 60000; // More than 1 minute

          if (likelyExpired) {
            setSessionExpired();
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, setSessionExpired]);

  return null; // This hook is for side effects only
}
```

### LogoutButton Component (src/features/auth/components/LogoutButton.tsx)

```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'ghost' | 'outline';
}

export function LogoutButton({ className = '', variant = 'ghost' }: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // No need to setIsLoggingOut(false) as component will unmount after redirect
  };

  const variantClasses = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`btn ${variantClasses[variant]} ${className}`}
      aria-label="Log out"
    >
      {isLoggingOut ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Logging out...
        </>
      ) : (
        <>
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
          Log out
        </>
      )}
    </button>
  );
}
```

### UserMenu Component (src/features/auth/components/UserMenu.tsx)

```typescript
import { useAuth } from '../hooks/useAuth';
import { LogoutButton } from './LogoutButton';

export function UserMenu() {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar placeholder"
        aria-label="User menu"
        aria-haspopup="true"
      >
        <div className="bg-primary text-primary-content rounded-full w-10">
          <span>{initials}</span>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
        role="menu"
      >
        <li className="menu-title">
          <span className="text-xs text-base-content/60">{user.email}</span>
        </li>
        <li className="border-t border-base-200 mt-2 pt-2">
          <LogoutButton variant="ghost" className="w-full justify-start" />
        </li>
      </ul>
    </div>
  );
}
```

### SessionExpiredHandler Component (src/features/auth/components/SessionExpiredHandler.tsx)

```typescript
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function SessionExpiredHandler() {
  const { sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionExpired) {
      // Don't redirect if already on login page
      if (location.pathname !== '/login') {
        navigate('/login?expired=true', { replace: true });
      }
      clearSessionExpired();
    }
  }, [sessionExpired, navigate, location.pathname, clearSessionExpired]);

  return null; // This is a side-effect only component
}
```

### Temporary Header Component (src/components/ui/Header.tsx)

Minimal placeholder until Story 1.9:

```typescript
import { UserMenu } from '../../features/auth/components/UserMenu';

export function Header() {
  return (
    <header className="navbar bg-base-100 shadow-sm border-b border-base-200">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl text-primary font-bold">
          IdeaSpark
        </a>
      </div>
      <div className="flex-none">
        <UserMenu />
      </div>
    </header>
  );
}
```

### Update LoginPage for Session Expiry Message (src/features/auth/pages/LoginPage.tsx)

```typescript
import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { user, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);

  useEffect(() => {
    // Check for expired query param
    if (searchParams.get('expired') === 'true') {
      setShowExpiredMessage(true);
      // Clear the query param
      searchParams.delete('expired');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Redirect if already logged in
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold justify-center mb-4">
            Welcome Back
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Sign in to continue to IdeaSpark
          </p>

          {/* Session expired message */}
          {showExpiredMessage && (
            <div className="alert alert-info mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Your session has expired. Please log in again.</span>
              <button
                onClick={() => setShowExpiredMessage(false)}
                className="btn btn-sm btn-ghost"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

### Types Extension (src/features/auth/types.ts)

Add session-related types if not present:

```typescript
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
}

export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_DELETED'
  | 'PASSWORD_RECOVERY';
```

### Updated Barrel Export (src/features/auth/index.ts)

```typescript
// Components
export { RegisterForm } from './components/RegisterForm';
export { LoginForm } from './components/LoginForm';
export { LogoutButton } from './components/LogoutButton';
export { UserMenu } from './components/UserMenu';
export { SessionExpiredHandler } from './components/SessionExpiredHandler';

// Pages
export { RegisterPage } from './pages/RegisterPage';
export { LoginPage } from './pages/LoginPage';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRegister } from './hooks/useRegister';
export { useLogin } from './hooks/useLogin';
export { useSession } from './hooks/useSession';

// Services
export { authService } from './services/authService';

// Schemas
export { registerSchema, loginSchema } from './schemas/authSchemas';
export type { RegisterFormData, LoginFormData } from './schemas/authSchemas';

// Types
export type * from './types';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `LogoutButton`, `UserMenu` |
| Files | `PascalCase.tsx` | `LogoutButton.tsx`, `UserMenu.tsx` |
| Hooks | `use` + `PascalCase` | `useSession` |
| Services | `camelCase` | `authService.signOut()` |
| Types | `PascalCase` | `AuthState`, `AuthEvent` |

### Anti-Patterns to AVOID

1. **DO NOT** call Supabase directly from components - use service layer
2. **DO NOT** block logout on network errors - always clear local state
3. **DO NOT** forget to clear React Query cache on logout
4. **DO NOT** show detailed error messages for auth operations
5. **DO NOT** redirect during initial session check (wait for loading to complete)
6. **DO NOT** use synchronous localStorage operations in render path
7. **DO NOT** assume logout always succeeds server-side - handle gracefully

### Supabase Auth Session Notes

Supabase Auth handles sessions automatically:
- Sessions stored in localStorage (supabase-auth-token)
- Auto token refresh before expiry
- `onAuthStateChange` fires on all auth events
- `signOut()` clears both server session and local storage

**Session Expiry Detection:**
- Supabase auto-refreshes tokens ~10 minutes before expiry
- If refresh fails (offline, expired), `SIGNED_OUT` event fires
- Distinguish user logout vs token expiry by tracking logout action

### Previous Story Learnings Applied

From **Story 1.4** (Registration Flow):
- Service layer pattern with `ServiceResponse<T>`
- React Query cache management patterns
- Toast/notification patterns

From **Story 1.5** (Login Flow):
- `useAuth` hook structure and session management
- Navigation patterns with React Router
- Loading state management
- Login page layout and styling

### Testing Checklist

- [ ] Logout button visible in header when logged in
- [ ] Click logout → session terminates → redirect to /login
- [ ] After logout, cannot access /dashboard directly (redirects to login)
- [ ] Page refresh after logout maintains logged-out state
- [ ] Logout works even when offline (clears local state)
- [ ] React Query cache cleared after logout (check DevTools)
- [ ] Session expiry → redirect to /login with expired message
- [ ] Expired message displays correctly on login page
- [ ] Expired message can be dismissed
- [ ] Multiple tabs: logout in one tab reflects in others
- [ ] User menu dropdown accessible via keyboard
- [ ] Logout button shows loading state during logout

### Dependencies on Previous Stories

- **Story 1.1:** ✅ Project initialized with React Query
- **Story 1.2:** ✅ PassportCard DaisyUI theme configured
- **Story 1.3:** ✅ Supabase Auth configured
- **Story 1.4:** ✅ useAuth hook, authService patterns established
- **Story 1.5:** ✅ Login flow, LoginPage, session persistence

### Next Story Dependencies

- **Story 1.7 (Password Reset):** Will use similar auth patterns
- **Story 1.8 (Protected Routes):** Will use useAuth for route protection, SessionExpiredHandler
- **Story 1.9 (Application Shell):** Will replace temporary Header with full navigation

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6]
- [Source: _bmad-output/implementation-artifacts/1-4-user-registration-flow.md]
- [Source: _bmad-output/implementation-artifacts/1-5-user-login-flow.md]
- [Supabase Auth signOut Documentation](https://supabase.com/docs/reference/javascript/auth-signout)
- [Supabase Auth onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [DaisyUI Dropdown Component](https://daisyui.com/components/dropdown/)
- [DaisyUI Navbar Component](https://daisyui.com/components/navbar/)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
