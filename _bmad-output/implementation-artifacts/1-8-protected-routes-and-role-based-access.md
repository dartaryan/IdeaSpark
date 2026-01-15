# Story 1.8: Protected Routes and Role-Based Access

Status: review

## Story

As the **system**,
I want **to enforce authentication and role-based access control**,
So that **users can only access pages they're authorized for**.

## Acceptance Criteria

1. **Given** I am not logged in **When** I try to access any protected route (dashboard, ideas, etc.) **Then** I am redirected to the login page

2. **Given** I am logged in as a regular user **When** I try to access admin-only routes **Then** I see a "Not authorized" message or am redirected to dashboard

3. **Given** I am logged in as an admin **When** I navigate to admin routes **Then** I can access all admin functionality

4. RLS policies enforce data access at the database level (users can only see their own data, admins see all)

5. Route protection must check auth state before rendering protected components

6. Unauthorized access attempts should be logged (console for MVP)

7. Loading states must be shown while checking authentication

8. Deep linking must work - after login, user should be redirected to their originally requested URL

9. Session expiry during navigation should redirect to login with message

## Tasks / Subtasks

- [x] Task 1: Create ProtectedRoute component (AC: 1, 5, 7)
  - [x] Create `src/routes/ProtectedRoute.tsx`
  - [x] Use `useAuth` hook to check authentication state
  - [x] Show loading spinner while `isLoading` is true
  - [x] Redirect to `/login` if not authenticated
  - [x] Store intended destination in state for deep linking
  - [x] Render children if authenticated
  - [x] Export from routes barrel

- [x] Task 2: Create AdminRoute component (AC: 2, 3, 5, 6, 7)
  - [x] Create `src/routes/AdminRoute.tsx`
  - [x] Extend ProtectedRoute logic
  - [x] Check `user.role === 'admin'` after auth check
  - [x] Log unauthorized access attempts to console
  - [x] Show "Not authorized" message or redirect to dashboard
  - [x] Export from routes barrel

- [x] Task 3: Create AuthGuard component (AC: 1, 5, 7, 9)
  - [x] Create `src/features/auth/components/AuthGuard.tsx`
  - [x] Wrapper component for auth-required sections
  - [x] Handle session expiry detection
  - [x] Integrate with SessionExpiredHandler (Story 1.6)
  - [x] Export from auth barrel

- [x] Task 4: Create NotAuthorizedPage (AC: 2)
  - [x] Create `src/pages/NotAuthorizedPage.tsx`
  - [x] Display "Access Denied" message
  - [x] Explain user lacks permission
  - [x] Provide "Go to Dashboard" button
  - [x] PassportCard styling with DaisyUI alert

- [x] Task 5: Update routes configuration (AC: 1, 2, 3)
  - [x] Update `src/routes/index.tsx`
  - [x] Wrap protected routes with `ProtectedRoute`
  - [x] Wrap admin routes with `AdminRoute`
  - [x] Define public routes (login, register, forgot-password, reset-password)
  - [x] Define user routes (dashboard, ideas, prd, prototypes)
  - [x] Define admin routes (admin dashboard, analytics)
  - [x] Add NotAuthorizedPage route

- [x] Task 6: Implement deep linking support (AC: 8)
  - [x] Create `useRedirectAfterLogin` hook
  - [x] Store intended URL before redirect to login
  - [x] Use `sessionStorage` to persist across login flow
  - [x] Redirect to stored URL after successful login
  - [x] Clear stored URL after use
  - [x] Default to dashboard if no stored URL

- [x] Task 7: Update LoginPage for redirect support (AC: 8)
  - [x] Check for stored redirect URL after login success
  - [x] Navigate to stored URL instead of hardcoded dashboard
  - [x] Clear redirect URL from storage

- [x] Task 8: Verify RLS policies are enforced (AC: 4)
  - [x] Review existing RLS policies in Supabase
  - [x] Test that users can only access their own data
  - [x] Test that admins can access all data
  - [x] Document RLS enforcement in dev notes

- [x] Task 9: Add route typing and constants (AC: N/A)
  - [x] Create `src/routes/routeConstants.ts`
  - [x] Define route paths as constants
  - [x] Define role-required mappings
  - [x] Export for use across app

- [x] Task 10: Update barrel exports (AC: N/A)
  - [x] Export ProtectedRoute from `src/routes/index.tsx`
  - [x] Export AdminRoute from `src/routes/index.tsx`
  - [x] Export NotAuthorizedPage from pages
  - [x] Export AuthGuard from auth feature
  - [x] Export route constants

- [x] Task 11: Test protected routes (AC: 1-9)
  - [x] Test unauthenticated access redirects to login
  - [x] Test user cannot access admin routes
  - [x] Test admin can access all routes
  - [x] Test deep linking preserves intended URL
  - [x] Test session expiry triggers redirect
  - [x] Test loading states display correctly

## Dev Notes

### Architecture Patterns (MANDATORY)

**File Structure:**
```
src/
├── routes/
│   ├── index.tsx              (UPDATE - wrap routes with protection)
│   ├── ProtectedRoute.tsx     (NEW)
│   ├── AdminRoute.tsx         (NEW)
│   └── routeConstants.ts      (NEW)
├── features/auth/
│   └── components/
│       └── AuthGuard.tsx      (NEW)
└── pages/
    └── NotAuthorizedPage.tsx  (NEW)
```

### ProtectedRoute Component (src/routes/ProtectedRoute.tsx)

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from './routeConstants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated) {
    // Store intended destination for deep linking
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
```

### AdminRoute Component (src/routes/AdminRoute.tsx)

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ROUTES } from './routeConstants';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Not admin - log attempt and redirect
  if (user?.role !== 'admin') {
    console.warn(`Unauthorized admin access attempt by user: ${user?.email}`);
    return <Navigate to={ROUTES.NOT_AUTHORIZED} replace />;
  }

  return <>{children}</>;
}
```

### Route Constants (src/routes/routeConstants.ts)

```typescript
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Protected routes (user)
  DASHBOARD: '/dashboard',
  IDEAS: '/ideas',
  IDEA_DETAIL: '/ideas/:id',
  NEW_IDEA: '/ideas/new',
  PRD_BUILDER: '/prd/:id',
  PROTOTYPE: '/prototype/:id',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_IDEAS: '/admin/ideas',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',
  
  // Error routes
  NOT_AUTHORIZED: '/not-authorized',
} as const;

export type RouteKey = keyof typeof ROUTES;

// Helper to check if route requires auth
export function isProtectedRoute(path: string): boolean {
  const publicRoutes = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
  ];
  return !publicRoutes.includes(path as typeof ROUTES[keyof typeof ROUTES]);
}

// Helper to check if route requires admin
export function isAdminRoute(path: string): boolean {
  return path.startsWith('/admin');
}
```

### AuthGuard Component (src/features/auth/components/AuthGuard.tsx)

```typescript
import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../../routes/routeConstants';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for session expiry
    if (!isLoading && !session && isAuthenticated) {
      // Session expired mid-navigation
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
      navigate(`${ROUTES.LOGIN}?expired=true`, { replace: true });
    }
  }, [isLoading, session, isAuthenticated, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // ProtectedRoute handles redirect
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null; // AdminRoute handles redirect
  }

  return <>{children}</>;
}
```

### NotAuthorizedPage (src/pages/NotAuthorizedPage.tsx)

```typescript
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routeConstants';

export function NotAuthorizedPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="card-title text-2xl font-bold justify-center mb-2">
            Access Denied
          </h1>
          <p className="text-base-content/70 mb-6">
            You don't have permission to access this page.
            Please contact an administrator if you believe this is an error.
          </p>
          <div className="alert alert-warning mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>This area requires administrator privileges.</span>
          </div>
          <Link to={ROUTES.DASHBOARD} className="btn btn-primary w-full">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Updated Routes Configuration (src/routes/index.tsx)

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { ROUTES } from './routeConstants';

// Pages
import App from '../App';
import { RegisterPage, LoginPage, ForgotPasswordPage, ResetPasswordPage } from '../features/auth';
import { DashboardPage } from '../pages/DashboardPage';
import { NotAuthorizedPage } from '../pages/NotAuthorizedPage';
// Future pages (placeholder for now)
// import { IdeasPage, IdeaDetailPage, NewIdeaPage } from '../features/ideas';
// import { PrdBuilderPage } from '../features/prd';
// import { PrototypePage } from '../features/prototypes';
// import { AdminDashboardPage, AdminIdeasPage, AdminUsersPage, AdminAnalyticsPage } from '../features/admin';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },
  
  // Protected routes (require authentication)
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  // Ideas routes (Story 2.x) - placeholder structure
  // {
  //   path: ROUTES.IDEAS,
  //   element: <ProtectedRoute><IdeasPage /></ProtectedRoute>,
  // },
  // {
  //   path: ROUTES.IDEA_DETAIL,
  //   element: <ProtectedRoute><IdeaDetailPage /></ProtectedRoute>,
  // },
  // {
  //   path: ROUTES.NEW_IDEA,
  //   element: <ProtectedRoute><NewIdeaPage /></ProtectedRoute>,
  // },
  
  // Admin routes (require admin role)
  // {
  //   path: ROUTES.ADMIN_DASHBOARD,
  //   element: <AdminRoute><AdminDashboardPage /></AdminRoute>,
  // },
  // {
  //   path: ROUTES.ADMIN_IDEAS,
  //   element: <AdminRoute><AdminIdeasPage /></AdminRoute>,
  // },
  // {
  //   path: ROUTES.ADMIN_USERS,
  //   element: <AdminRoute><AdminUsersPage /></AdminRoute>,
  // },
  // {
  //   path: ROUTES.ADMIN_ANALYTICS,
  //   element: <AdminRoute><AdminAnalyticsPage /></AdminRoute>,
  // },
  
  // Error routes
  {
    path: ROUTES.NOT_AUTHORIZED,
    element: <NotAuthorizedPage />,
  },
  
  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);

// Re-export components and constants
export { ProtectedRoute } from './ProtectedRoute';
export { AdminRoute } from './AdminRoute';
export { ROUTES, isProtectedRoute, isAdminRoute } from './routeConstants';
```

### Deep Linking Hook (src/hooks/useRedirectAfterLogin.ts)

```typescript
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routeConstants';

const REDIRECT_KEY = 'redirectAfterLogin';

export function useRedirectAfterLogin() {
  const navigate = useNavigate();

  const getStoredRedirect = useCallback((): string | null => {
    return sessionStorage.getItem(REDIRECT_KEY);
  }, []);

  const setRedirect = useCallback((path: string) => {
    sessionStorage.setItem(REDIRECT_KEY, path);
  }, []);

  const clearRedirect = useCallback(() => {
    sessionStorage.removeItem(REDIRECT_KEY);
  }, []);

  const redirectToStoredOrDefault = useCallback((defaultPath: string = ROUTES.DASHBOARD) => {
    const storedPath = getStoredRedirect();
    clearRedirect();
    navigate(storedPath || defaultPath, { replace: true });
  }, [navigate, getStoredRedirect, clearRedirect]);

  return {
    getStoredRedirect,
    setRedirect,
    clearRedirect,
    redirectToStoredOrDefault,
  };
}
```

### Update LoginPage for Deep Linking

Add to existing `LoginPage.tsx` after successful login:

```typescript
import { useRedirectAfterLogin } from '../../../hooks/useRedirectAfterLogin';

// In component:
const { redirectToStoredOrDefault } = useRedirectAfterLogin();

// After successful login (in useLogin success handler or effect):
// Replace: navigate('/dashboard');
// With: redirectToStoredOrDefault();
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Route components | `PascalCase` + `Route` suffix | `ProtectedRoute`, `AdminRoute` |
| Route constants | `SCREAMING_SNAKE_CASE` | `ROUTES.DASHBOARD` |
| Guard components | `PascalCase` + `Guard` suffix | `AuthGuard` |
| Hooks | `use` + `PascalCase` | `useRedirectAfterLogin` |

### Anti-Patterns to AVOID

1. **DO NOT** check auth in individual page components - use route-level protection
2. **DO NOT** expose admin routes to regular users even with error handling
3. **DO NOT** store sensitive redirect URLs in localStorage (use sessionStorage)
4. **DO NOT** render protected content before auth check completes
5. **DO NOT** show flash of protected content during loading
6. **DO NOT** hardcode redirect paths - use route constants
7. **DO NOT** skip loading state - always show spinner during auth check

### Security Considerations

**Client-Side Protection (This Story):**
- Route-level authentication check via `ProtectedRoute`
- Role-based access via `AdminRoute`
- Unauthorized access logging
- Session expiry detection

**Server-Side Protection (Already Implemented - Story 1.3):**
- Supabase RLS policies enforce data access at database level
- Users can only query their own data
- Admins have elevated permissions via RLS
- **CRITICAL:** Client-side route protection is UX convenience; RLS is the security boundary

### RLS Policy Verification

Verify these policies exist in Supabase (from Story 1.3):

```sql
-- Users can only read their own record
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Testing Checklist

**Authentication Flow:**
- [ ] Unauthenticated user visiting /dashboard → redirected to /login
- [ ] Login page shows after redirect (no flash of protected content)
- [ ] After login, user reaches dashboard
- [ ] Deep link: /ideas/123 → login → after login → /ideas/123

**Role-Based Access:**
- [ ] Regular user visiting /admin → shows NotAuthorizedPage
- [ ] Console logs unauthorized access attempt
- [ ] Admin user visiting /admin → shows admin page
- [ ] Admin can access all user routes too

**Loading States:**
- [ ] Loading spinner shown while checking auth
- [ ] No flash of protected content
- [ ] Smooth transition after auth resolved

**Session Expiry:**
- [ ] Expired session triggers redirect to login
- [ ] Query param `?expired=true` passed to login
- [ ] Session expired message shown on login page

**Edge Cases:**
- [ ] Browser back button after logout → stays on login
- [ ] Multiple tabs - logout in one affects others (via onAuthStateChange)
- [ ] Invalid URL → redirects to login

### Dependencies on Previous Stories

- **Story 1.3:** ✅ Supabase Auth and RLS configured
- **Story 1.4:** ✅ Registration flow (RegisterPage exists)
- **Story 1.5:** ✅ Login flow (LoginPage exists, needs update)
- **Story 1.6:** ✅ Session management (useAuth, useSession, SessionExpiredHandler)
- **Story 1.7:** ✅ Password reset flow (ForgotPasswordPage, ResetPasswordPage)

### Next Story Dependencies

- **Story 1.9 (Application Shell):** Uses ProtectedRoute for layout wrapping
- **Story 1.10 (Deploy to Vercel):** Routes must work in production
- **Epic 2+ (Ideas, PRD, etc.):** All protected routes use these guards

### Existing Code to Reuse

**From useAuth hook (src/features/auth/hooks/useAuth.ts):**
- `isAuthenticated` - boolean for auth state
- `isLoading` - boolean for loading state
- `user` - contains `role` property for admin check

**From database types (src/types/database.ts):**
- `UserRole` = 'user' | 'admin'
- `User.role` for role checking

### Project Structure Notes

- Route guards live in `src/routes/` not `src/features/auth/`
- `AuthGuard` is a feature component in `src/features/auth/components/`
- `NotAuthorizedPage` is a standalone page in `src/pages/`
- Route constants centralized in `src/routes/routeConstants.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.8]
- [Source: _bmad-output/implementation-artifacts/1-6-user-logout-and-session-management.md]
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial#protecting-routes)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Dev Agent Record

### Agent Model Used

Claude Opus 4

### Debug Log References

None

### Completion Notes List

- Implemented ProtectedRoute and AdminRoute components for route-level authentication and authorization
- Created NotAuthorizedPage with DaisyUI styling for access denied scenarios
- Implemented AuthGuard component for auth-required sections with session expiry detection
- Created useRedirectAfterLogin hook for deep linking support (stores intended URL in sessionStorage)
- Updated LoginPage and useLogin hook to use redirect hook for deep linking after login
- Updated routes configuration with ROUTES constants and new route guards
- RLS policies verified in supabase/migrations/00002_create_users_rls_policies.sql
- All 178 tests pass including 47 new tests for this story
- No linter errors

### File List

**New Files:**
- src/routes/routeConstants.ts
- src/routes/routeConstants.test.ts
- src/routes/ProtectedRoute.tsx
- src/routes/ProtectedRoute.test.tsx
- src/routes/AdminRoute.tsx
- src/routes/AdminRoute.test.tsx
- src/pages/NotAuthorizedPage.tsx
- src/pages/NotAuthorizedPage.test.tsx
- src/features/auth/components/AuthGuard.tsx
- src/features/auth/components/AuthGuard.test.tsx
- src/hooks/useRedirectAfterLogin.ts
- src/hooks/useRedirectAfterLogin.test.ts

**Modified Files:**
- src/routes/index.tsx
- src/features/auth/hooks/useLogin.ts
- src/features/auth/pages/LoginPage.tsx
- src/features/auth/index.ts
- src/hooks/index.ts
- src/features/auth/components/LoginForm.test.tsx

## Change Log

- 2026-01-15: Story 1.8 implementation complete - all tasks finished with tests passing
