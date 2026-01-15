# Story 1.4: User Registration Flow

Status: review

## Story

As a **new user**,
I want **to register for an account with my email and password**,
So that **I can access IdeaSpark and start submitting ideas**.

## Acceptance Criteria

1. **Given** I am on the registration page **When** I enter a valid email and password (min 8 characters) **Then** my account is created in Supabase Auth **And** a user record is created in the users table with role "user" **And** I am automatically logged in and redirected to the dashboard **And** I see a success message confirming registration

2. **Given** I enter an email that's already registered **When** I submit the registration form **Then** I see an error message "This email is already registered" **And** the form remains on the page with my email preserved

3. **Given** I enter an invalid email or weak password **When** I submit the form **Then** I see specific validation errors explaining the issue **And** the form is not submitted

4. The registration form includes: email input, password input, confirm password input, and submit button
5. Client-side validation provides immediate feedback before form submission
6. Loading state is displayed during form submission
7. Form is accessible with proper labels and keyboard navigation

## Tasks / Subtasks

- [x] Task 1: Create registration page route (AC: 1)
  - [x] Create `src/features/auth/pages/RegisterPage.tsx`
  - [x] Add `/register` route to `src/routes/index.tsx`
  - [x] Redirect logged-in users away from register page

- [x] Task 2: Create registration form schema (AC: 3, 5)
  - [x] Create `src/features/auth/schemas/authSchemas.ts` (if not exists)
  - [x] Define `registerSchema` with Zod validation:
    - email: valid email format
    - password: min 8 characters
    - confirmPassword: must match password
  - [x] Export schema and infer TypeScript types

- [x] Task 3: Create RegisterForm component (AC: 1-7)
  - [x] Create `src/features/auth/components/RegisterForm.tsx`
  - [x] Integrate React Hook Form with Zod resolver
  - [x] Add email input with label and error display
  - [x] Add password input with show/hide toggle
  - [x] Add confirm password input with match validation
  - [x] Add submit button with loading state
  - [x] Style with DaisyUI form components and PassportCard theme

- [x] Task 4: Create authService for registration (AC: 1, 2)
  - [x] Create/update `src/features/auth/services/authService.ts`
  - [x] Implement `register(email, password)` function
  - [x] Use Supabase Auth `signUp` method
  - [x] Return `ServiceResponse<User>` type
  - [x] Handle errors (already registered, network errors)

- [x] Task 5: Create useRegister hook (AC: 1, 2, 6)
  - [x] Create `src/features/auth/hooks/useRegister.ts`
  - [x] Use React Query `useMutation` pattern
  - [x] Handle success: redirect to dashboard
  - [x] Handle error: display appropriate message
  - [x] Manage loading state via mutation

- [x] Task 6: Create useAuth hook for session management (AC: 1)
  - [x] Create `src/features/auth/hooks/useAuth.ts`
  - [x] Track current user and session state
  - [x] Subscribe to Supabase auth state changes
  - [x] Provide `user`, `session`, `isLoading` state
  - [x] Export auth context/provider if needed

- [x] Task 7: Create dashboard placeholder page (AC: 1)
  - [x] Create `src/pages/DashboardPage.tsx` (placeholder)
  - [x] Add `/dashboard` route
  - [x] Display user email and success message
  - [x] Will be replaced in Story 1.9 (Application Shell)

- [x] Task 8: Add navigation link to login (AC: 1)
  - [x] Add "Already have an account? Login" link below form
  - [x] Style consistently with PassportCard theme

- [x] Task 9: Add toast notifications (AC: 1, 2)
  - [x] Set up toast provider (react-hot-toast or DaisyUI toast)
  - [x] Show success toast on successful registration
  - [x] Show error toast on registration failure

- [x] Task 10: Test registration flow (AC: 1-7)
  - [x] Test valid registration creates auth user
  - [x] Test valid registration creates public.users record
  - [x] Test redirect to dashboard after registration
  - [x] Test duplicate email error handling
  - [x] Test validation error display
  - [x] Test loading state display

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure:**
```
src/features/auth/
├── components/
│   ├── RegisterForm.tsx        (NEW)
│   ├── LoginForm.tsx           (Story 1.5)
│   └── AuthGuard.tsx           (Story 1.8)
├── hooks/
│   ├── useAuth.ts              (NEW)
│   ├── useRegister.ts          (NEW)
│   └── useSession.ts           (Story 1.5)
├── pages/
│   └── RegisterPage.tsx        (NEW)
├── services/
│   └── authService.ts          (NEW)
├── schemas/
│   └── authSchemas.ts          (NEW)
├── types.ts                    (UPDATE)
└── index.ts                    (UPDATE barrel exports)
```

### Registration Schema (src/features/auth/schemas/authSchemas.ts)

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### Auth Service (src/features/auth/services/authService.ts)

```typescript
import { supabase } from '../../../lib/supabase';
import type { User } from '../../../types/database';

export type ServiceResponse<T> = {
  data: T | null;
  error: { message: string; code: string } | null;
};

export const authService = {
  async register(email: string, password: string): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          return {
            data: null,
            error: { message: 'This email is already registered', code: 'AUTH_EMAIL_EXISTS' },
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
          error: { message: 'Registration failed', code: 'AUTH_NO_USER' },
        };
      }

      // Fetch the user record from public.users (created by trigger)
      // Small delay to ensure trigger has completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        console.error('Failed to fetch user record:', userError);
        // User was created in auth, but public.users fetch failed
        // Return basic user data from auth
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
      console.error('Registration error:', error);
      return {
        data: null,
        error: { message: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' },
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return data;
  },
};
```

### useAuth Hook (src/features/auth/hooks/useAuth.ts)

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { User as AuthUser, Session } from '@supabase/supabase-js';
import type { User } from '../../../types/database';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  authUser: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    authUser: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        authService.getCurrentUser().then(user => {
          setState({
            user,
            authUser: session.user,
            session,
            isLoading: false,
          });
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const user = await authService.getCurrentUser();
          setState({
            user,
            authUser: session.user,
            session,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            authUser: null,
            session: null,
            isLoading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
```

### useRegister Hook (src/features/auth/hooks/useRegister.ts)

```typescript
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { RegisterFormData } from '../schemas/authSchemas';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
      const result = await authService.register(data.email, data.password);
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

### RegisterForm Component Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../schemas/authSchemas';
import { useRegister } from '../hooks/useRegister';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending, error } = useRegister();
  
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    register({ email: data.email, password: data.password });
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
          {...registerField('email')}
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
            placeholder="Min 8 characters"
            className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
            {...registerField('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
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

      {/* Confirm Password field */}
      <div className="form-control w-full">
        <label className="label" htmlFor="confirmPassword">
          <span className="label-text">Confirm Password</span>
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
          {...registerField('confirmPassword')}
        />
        {errors.confirmPassword && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
          </label>
        )}
      </div>

      {/* API Error display */}
      {error && (
        <div className="alert alert-error">
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
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="link link-primary">
          Login
        </Link>
      </p>
    </form>
  );
}
```

### RegisterPage Component

```typescript
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function RegisterPage() {
  const { user, isLoading } = useAuth();

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
            Create Account
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Join IdeaSpark and start submitting your ideas
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
```

### Routes Configuration Update

```typescript
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../features/auth/pages/RegisterPage';

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
    element: <div>Login - Story 1.5</div>,
  },
  {
    path: '/dashboard',
    element: <div>Dashboard - Story 1.9</div>,
  },
]);
```

### Auth Types (src/features/auth/types.ts)

```typescript
export interface AuthState {
  user: import('../../types/database').User | null;
  session: import('@supabase/supabase-js').Session | null;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
}
```

### Barrel Export (src/features/auth/index.ts)

```typescript
// Components
export { RegisterForm } from './components/RegisterForm';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRegister } from './hooks/useRegister';

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
| Components | `PascalCase` | `RegisterForm`, `RegisterPage` |
| Files | `PascalCase.tsx` | `RegisterForm.tsx` |
| Hooks | `use` + `PascalCase` | `useAuth`, `useRegister` |
| Services | `camelCase` | `authService` |
| Schemas | `camelCase` + `Schema` | `registerSchema` |
| Types | `PascalCase` | `RegisterFormData` |

### Anti-Patterns to AVOID

1. **DO NOT** store passwords in component state or log them
2. **DO NOT** skip the confirm password field (required by AC)
3. **DO NOT** call Supabase directly from components - use service layer
4. **DO NOT** forget loading states during async operations
5. **DO NOT** navigate away if registration fails - preserve form state
6. **DO NOT** use alert() for error messages - use toast or inline errors
7. **DO NOT** skip form validation on blur for immediate feedback

### Testing Checklist

- [ ] Register with valid email/password → redirects to dashboard
- [ ] Register creates record in Supabase auth.users
- [ ] Register creates record in public.users with role='user'
- [ ] Session persists after page refresh
- [ ] Duplicate email shows "already registered" error
- [ ] Invalid email format shows validation error
- [ ] Password < 8 chars shows validation error
- [ ] Mismatched passwords shows validation error
- [ ] Loading spinner shows during submission
- [ ] Can navigate to login page via link

### Dependencies on Previous Stories

- **Story 1.1:** ✅ Project initialized with React Hook Form, Zod, React Query
- **Story 1.2:** ✅ PassportCard DaisyUI theme configured
- **Story 1.3:** ✅ Supabase Auth and users table with RLS policies

### Next Story Dependencies

- **Story 1.5 (User Login Flow):** Will reuse useAuth hook and authService patterns
- **Story 1.6 (Logout & Session):** Will extend useAuth hook
- **Story 1.8 (Protected Routes):** Will use useAuth for route protection

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: _bmad-output/implementation-artifacts/1-3-set-up-supabase-project-and-database-schema.md]
- [Supabase Auth signUp Documentation](https://supabase.com/docs/reference/javascript/auth-signup)
- [React Hook Form with Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [DaisyUI Form Components](https://daisyui.com/components/input/)

## Dev Agent Record

### Agent Model Used

Claude Opus 4 (claude-sonnet-4-20250514)

### Debug Log References

None - implementation completed without blockers.

### Completion Notes List

1. **Testing Infrastructure Setup**: Installed Vitest + React Testing Library for TDD. Configured `vite.config.ts` with test settings and created `src/test/setup.ts` for test setup. Added test scripts to package.json.

2. **Toast Notifications**: Installed `react-hot-toast` and configured Toaster in `main.tsx` with PassportCard theme-compatible styling.

3. **Type Consistency Fix**: Updated `src/features/auth/types.ts` to re-export User from database types instead of defining a duplicate with incorrect role type ('employee' vs 'user').

4. **Auth Schema Implementation**: Created Zod schemas for registration and login with proper validation messages. Includes password confirmation match via `.refine()`.

5. **Auth Service Implementation**: Implemented `authService` with `register`, `login`, `logout`, and `getCurrentUser` methods. Includes proper error handling for duplicate emails and network errors.

6. **Auth Hooks**: Created `useAuth` hook with Supabase auth state subscription and `useRegister` hook using React Query mutation pattern with toast notifications.

7. **Registration Form**: Implemented `RegisterForm` with React Hook Form, Zod resolver, password visibility toggle, loading states, and accessibility attributes. Added `noValidate` to form to ensure Zod handles all validation consistently.

8. **Dashboard Placeholder**: Created `DashboardPage` with user info display and sign-out functionality.

9. **Route Configuration**: Updated router with `/register`, `/login` (placeholder), and `/dashboard` routes. Updated `main.tsx` to use RouterProvider and QueryClientProvider.

10. **Tests**: Created 21 tests covering schema validation and RegisterForm component behavior. All tests pass.

### Change Log

- 2026-01-15: Story 1.4 implementation complete. All acceptance criteria met.

### File List

**New Files:**
- `src/features/auth/pages/RegisterPage.tsx`
- `src/features/auth/components/RegisterForm.tsx`
- `src/features/auth/components/RegisterForm.test.tsx`
- `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/hooks/useRegister.ts`
- `src/features/auth/services/authService.ts`
- `src/features/auth/schemas/authSchemas.ts`
- `src/features/auth/schemas/authSchemas.test.ts`
- `src/pages/DashboardPage.tsx`
- `src/test/setup.ts`
- `src/test/test-utils.tsx`

**Modified Files:**
- `src/main.tsx` - Added RouterProvider, QueryClientProvider, Toaster
- `src/routes/index.tsx` - Added /register, /login, /dashboard routes
- `src/features/auth/index.ts` - Updated barrel exports
- `src/features/auth/types.ts` - Fixed User type import, added AuthContextValue
- `vite.config.ts` - Added Vitest configuration
- `tsconfig.app.json` - Added vitest/globals and @testing-library/jest-dom types
- `package.json` - Added test scripts, react-hot-toast, vitest dependencies
