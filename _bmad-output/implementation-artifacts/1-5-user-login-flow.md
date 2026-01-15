# Story 1.5: User Login Flow

Status: review

## Story

As a **registered user**,
I want **to log in with my email and password**,
So that **I can access my ideas and continue working**.

## Acceptance Criteria

1. **Given** I am on the login page **When** I enter valid credentials **Then** I am authenticated and redirected to the dashboard **And** my session is persisted (survives page refresh)

2. **Given** I enter incorrect credentials **When** I submit the login form **Then** I see an error message "Invalid email or password" **And** the form allows me to try again

3. **Given** I am already logged in **When** I navigate to the login page **Then** I am automatically redirected to the dashboard

4. The login form includes: email input, password input, remember me checkbox (optional), and submit button
5. Client-side validation provides immediate feedback before form submission
6. Loading state is displayed during form submission
7. Form is accessible with proper labels and keyboard navigation
8. Password field includes show/hide toggle for usability

## Tasks / Subtasks

- [x] Task 1: Create login page route (AC: 1, 3)
  - [x] Create `src/features/auth/pages/LoginPage.tsx`
  - [x] Update `/login` route in `src/routes/index.tsx` to use LoginPage
  - [x] Redirect logged-in users away from login page (reuse pattern from RegisterPage)

- [x] Task 2: Extend auth schemas with login schema (AC: 5)
  - [x] Verify `loginSchema` exists in `src/features/auth/schemas/authSchemas.ts`
  - [x] If not present, add login schema with Zod validation:
    - email: valid email format
    - password: required (no min length for login - let server validate)
  - [x] Export `LoginFormData` type

- [x] Task 3: Create LoginForm component (AC: 1-8)
  - [x] Create `src/features/auth/components/LoginForm.tsx`
  - [x] Integrate React Hook Form with Zod resolver
  - [x] Add email input with label and error display
  - [x] Add password input with show/hide toggle
  - [x] Add submit button with loading state
  - [x] Style with DaisyUI form components and PassportCard theme
  - [x] Add link to registration page
  - [x] Add link to password reset page (placeholder for Story 1.7)

- [x] Task 4: Extend authService for login (AC: 1, 2)
  - [x] Add `login(email, password)` function to `authService`
  - [x] Use Supabase Auth `signInWithPassword` method
  - [x] Return `ServiceResponse<User>` type
  - [x] Handle errors (invalid credentials, network errors)

- [x] Task 5: Create useLogin hook (AC: 1, 2, 6)
  - [x] Create `src/features/auth/hooks/useLogin.ts`
  - [x] Use React Query `useMutation` pattern
  - [x] Handle success: redirect to dashboard
  - [x] Handle error: display appropriate error message
  - [x] Manage loading state via mutation

- [x] Task 6: Verify useAuth hook handles login session (AC: 1)
  - [x] Ensure useAuth hook from Story 1.4 detects login state changes
  - [x] Verify session persistence across page refresh
  - [x] Test auth state subscription updates on login

- [x] Task 7: Add toast notifications for login (AC: 1, 2)
  - [x] Show success toast on successful login
  - [x] Show error toast on login failure
  - [x] Reuse toast infrastructure from Story 1.4

- [x] Task 8: Update barrel exports (AC: N/A)
  - [x] Export LoginForm from `src/features/auth/index.ts`
  - [x] Export useLogin hook
  - [x] Export LoginFormData type if needed

- [x] Task 9: Test login flow (AC: 1-8)
  - [x] Test valid login authenticates user
  - [x] Test valid login redirects to dashboard
  - [x] Test session persists after page refresh
  - [x] Test invalid credentials show error message
  - [x] Test email preserved in form after failed login
  - [x] Test password cleared after failed login
  - [x] Test already logged-in users redirect from /login
  - [x] Test loading state display during submission

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure (Extending from Story 1.4):**
```
src/features/auth/
├── components/
│   ├── RegisterForm.tsx        (Story 1.4 - EXISTING)
│   ├── LoginForm.tsx           (NEW)
│   ├── PasswordResetForm.tsx   (Story 1.7)
│   └── AuthGuard.tsx           (Story 1.8)
├── hooks/
│   ├── useAuth.ts              (Story 1.4 - EXISTING)
│   ├── useRegister.ts          (Story 1.4 - EXISTING)
│   ├── useLogin.ts             (NEW)
│   └── useSession.ts           (Story 1.6)
├── pages/
│   ├── RegisterPage.tsx        (Story 1.4 - EXISTING)
│   └── LoginPage.tsx           (NEW)
├── services/
│   └── authService.ts          (UPDATE - add login method)
├── schemas/
│   └── authSchemas.ts          (UPDATE if loginSchema missing)
├── types.ts                    (EXISTING)
└── index.ts                    (UPDATE barrel exports)
```

### Login Schema (src/features/auth/schemas/authSchemas.ts)

If not already present from Story 1.4, add:

```typescript
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### Auth Service Extension (src/features/auth/services/authService.ts)

Add the login method to the existing authService:

```typescript
export const authService = {
  // ... existing register method from Story 1.4

  async login(email: string, password: string): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase returns generic error for invalid credentials
        // Map to user-friendly message
        if (error.message.includes('Invalid login credentials')) {
          return {
            data: null,
            error: { message: 'Invalid email or password', code: 'AUTH_INVALID_CREDENTIALS' },
          };
        }
        return {
          data: null,
          error: { message: error.message, code: 'AUTH_ERROR' },
        };
      }

      if (!data.user) {
        return {
          data: null,
          error: { message: 'Login failed', code: 'AUTH_NO_USER' },
        };
      }

      // Fetch user record from public.users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        console.error('Failed to fetch user record:', userError);
        // User authenticated but public.users fetch failed
        // Return basic data from auth
        return {
          data: {
            id: data.user.id,
            email: data.user.email!,
            role: 'user' as const,
            created_at: data.user.created_at!,
            updated_at: data.user.created_at!,
          },
          error: null,
        };
      }

      return { data: userData, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return {
        data: null,
        error: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  // ... existing getCurrentUser method from Story 1.4
};
```

### useLogin Hook (src/features/auth/hooks/useLogin.ts)

```typescript
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginFormData } from '../schemas/authSchemas';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await authService.login(data.email, data.password);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
  });
}
```

### LoginForm Component Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { useLogin } from '../hooks/useLogin';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, error } = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email field */}
      <div className="form-control w-full">
        <label className="label" htmlFor="email">
          <span className="label-text">Email</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
          {...register('email')}
          autoComplete="email"
        />
        {errors.email && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.email.message}</span>
          </label>
        )}
      </div>

      {/* Password field with show/hide toggle */}
      <div className="form-control w-full">
        <label className="label" htmlFor="password">
          <span className="label-text">Password</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
            {...register('password')}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
      </div>

      {/* Forgot password link */}
      <div className="flex justify-end">
        <Link to="/forgot-password" className="link link-primary text-sm">
          Forgot password?
        </Link>
      </div>

      {/* API Error display */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error.message}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Register link */}
      <p className="text-center text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="link link-primary">
          Create one
        </Link>
      </p>
    </form>
  );
}
```

### LoginPage Component

```typescript
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function LoginPage() {
  const { user, isLoading } = useAuth();

  // Redirect if already logged in (AC: 3)
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
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

### Routes Configuration Update

```typescript
// src/routes/index.tsx - UPDATE the /login route
import { createBrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LoginPage } from '../features/auth/pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home - Coming soon</div>,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,  // UPDATE: Was placeholder, now actual component
  },
  {
    path: '/forgot-password',
    element: <div>Password Reset - Story 1.7</div>,  // Placeholder for Story 1.7
  },
  {
    path: '/dashboard',
    element: <div>Dashboard - Story 1.9</div>,
  },
]);
```

### Updated Barrel Export (src/features/auth/index.ts)

```typescript
// Components
export { RegisterForm } from './components/RegisterForm';
export { LoginForm } from './components/LoginForm';

// Pages
export { RegisterPage } from './pages/RegisterPage';
export { LoginPage } from './pages/LoginPage';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRegister } from './hooks/useRegister';
export { useLogin } from './hooks/useLogin';

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
| Components | `PascalCase` | `LoginForm`, `LoginPage` |
| Files | `PascalCase.tsx` | `LoginForm.tsx`, `LoginPage.tsx` |
| Hooks | `use` + `PascalCase` | `useLogin` |
| Services | `camelCase` | `authService.login()` |
| Schemas | `camelCase` + `Schema` | `loginSchema` |
| Types | `PascalCase` | `LoginFormData` |

### Anti-Patterns to AVOID

1. **DO NOT** store or log passwords anywhere
2. **DO NOT** reveal whether email exists in error messages (use generic "Invalid email or password")
3. **DO NOT** call Supabase directly from components - use service layer
4. **DO NOT** forget loading states during async operations
5. **DO NOT** clear email field after failed login - only clear password
6. **DO NOT** skip the autoComplete attributes (email, current-password) for better UX
7. **DO NOT** use alert() for error messages - use toast or inline errors

### Session Persistence Note

Supabase Auth automatically handles session persistence via localStorage. The `useAuth` hook's subscription to `onAuthStateChange` ensures the app state stays in sync with the stored session. This means:

- Sessions survive page refresh (AC: 1)
- Session tokens auto-refresh before expiry
- Logout on one tab reflects on all tabs

### Previous Story Learnings Applied

From **Story 1.3** (Supabase Setup):
- Use `supabase.auth.signInWithPassword()` for login
- RLS policies ensure users can only access their own data after login

From **Story 1.4** (Registration Flow):
- Reuse `useAuth` hook for session state management
- Mirror the form patterns (React Hook Form + Zod + DaisyUI)
- Use same error handling patterns (ServiceResponse type)
- Consistent toast notification approach

### Testing Checklist

- [x] Login with valid credentials → authenticates and redirects to dashboard
- [x] Session persists after page refresh (check Supabase session in dev tools)
- [x] Invalid email format shows validation error
- [x] Empty password shows validation error
- [x] Wrong credentials show "Invalid email or password" error
- [x] Email is preserved after failed login attempt
- [x] Password is cleared after failed login attempt (security)
- [x] Loading spinner shows during submission
- [x] Already logged-in user visiting /login is redirected to /dashboard
- [x] Can navigate to register page via link
- [x] Can navigate to forgot password page via link

### Dependencies on Previous Stories

- **Story 1.1:** ✅ Project initialized with React Hook Form, Zod, React Query
- **Story 1.2:** ✅ PassportCard DaisyUI theme configured
- **Story 1.3:** ✅ Supabase Auth configured with users table and RLS
- **Story 1.4:** ✅ useAuth hook, authService patterns, registration flow established

### Next Story Dependencies

- **Story 1.6 (Logout & Session Management):** Will extend useAuth hook with signOut method
- **Story 1.7 (Password Reset):** Will add password reset to authService
- **Story 1.8 (Protected Routes):** Will use useAuth for route protection

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/implementation-artifacts/1-4-user-registration-flow.md]
- [Supabase Auth signInWithPassword Documentation](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [React Hook Form with Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [DaisyUI Form Components](https://daisyui.com/components/input/)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

None - implementation completed without errors.

### Completion Notes List

1. **loginSchema and LoginFormData already existed** - Story 1.4 had already created these in `authSchemas.ts`, so Task 2 was verified as complete.

2. **authService.login() already existed** - Story 1.4 had already implemented the login method, but error handling was improved to return "Invalid email or password" for invalid credentials (AC: 2).

3. **useAuth hook from Story 1.4 handles login sessions** - The existing `onAuthStateChange` subscription automatically detects login state changes and updates the app state.

4. **Password clearing on failed login** - Implemented in `LoginForm.tsx` using `onError` callback in the mutation to clear password field while preserving email.

5. **Test selector fix** - Tests initially failed because `/password/i` regex matched both the password input label and "Show password" button's aria-label. Fixed by using `/^password$/i` to match exactly.

6. **Added /forgot-password placeholder route** - Added to routes configuration for Story 1.7 password reset flow.

7. **All 34 tests pass** - 13 LoginForm tests, 12 RegisterForm tests, 9 authSchemas tests.

### File List

**Created:**
- `src/features/auth/pages/LoginPage.tsx` - Login page component with auth redirect
- `src/features/auth/components/LoginForm.tsx` - Login form with validation and show/hide toggle
- `src/features/auth/hooks/useLogin.ts` - React Query mutation hook for login
- `src/features/auth/components/LoginForm.test.tsx` - Comprehensive test suite (13 tests)

**Modified:**
- `src/features/auth/services/authService.ts` - Improved error handling for invalid credentials
- `src/routes/index.tsx` - Updated /login route, added /forgot-password placeholder
- `src/features/auth/index.ts` - Added exports for LoginForm, LoginPage, useLogin
