# Story 1.7: Password Reset Flow

Status: ready-for-dev

## Story

As a **user who forgot my password**,
I want **to reset my password via email**,
So that **I can regain access to my account**.

## Acceptance Criteria

1. **Given** I am on the password reset page **When** I enter my registered email **Then** a password reset email is sent via Supabase Auth **And** I see a confirmation message "Check your email for reset instructions"

2. **Given** I click the reset link in my email **When** I enter a new password (min 8 characters) **Then** my password is updated **And** I am redirected to login with a success message

3. **Given** I enter an unregistered email **When** I submit the reset request **Then** I still see the same confirmation message (security best practice - do not reveal if email exists)

4. Password must meet minimum requirements (8+ characters)
5. Password confirmation field must match
6. Form validation using Zod schemas consistent with Stories 1.4 and 1.5
7. Loading states during email send and password update operations
8. Error handling for network failures with user-friendly messages
9. Link to login page from password reset page

## Tasks / Subtasks

- [ ] Task 1: Create password reset Zod schemas (AC: 4, 5, 6)
  - [ ] Add `forgotPasswordSchema` to `src/features/auth/schemas/authSchemas.ts`
  - [ ] Add `resetPasswordSchema` with password + confirmPassword fields
  - [ ] Password validation: min 8 characters
  - [ ] Export schema types `ForgotPasswordFormData` and `ResetPasswordFormData`

- [ ] Task 2: Extend authService with password reset methods (AC: 1, 2, 3)
  - [ ] Add `requestPasswordReset(email: string)` method to `src/features/auth/services/authService.ts`
  - [ ] Use Supabase Auth `resetPasswordForEmail()` method
  - [ ] Add `updatePassword(newPassword: string)` method for password change
  - [ ] Use Supabase Auth `updateUser({ password })` method
  - [ ] Return `ServiceResponse<void>` types for both methods
  - [ ] Configure redirect URL for reset email link

- [ ] Task 3: Create useForgotPassword hook (AC: 1, 3, 7)
  - [ ] Create `src/features/auth/hooks/useForgotPassword.ts`
  - [ ] Handle email submission to authService
  - [ ] Manage loading/success/error states
  - [ ] Always show success (security best practice - no email enumeration)
  - [ ] Export hook from feature barrel

- [ ] Task 4: Create useResetPassword hook (AC: 2, 4, 7)
  - [ ] Create `src/features/auth/hooks/useResetPassword.ts`
  - [ ] Handle new password submission
  - [ ] Manage loading/success/error states
  - [ ] Navigate to login on success with success message
  - [ ] Export hook from feature barrel

- [ ] Task 5: Create ForgotPasswordForm component (AC: 1, 3, 6, 7, 9)
  - [ ] Create `src/features/auth/components/ForgotPasswordForm.tsx`
  - [ ] Email input field with validation
  - [ ] Submit button with loading state
  - [ ] Success message display after submission
  - [ ] Link back to login page
  - [ ] Use React Hook Form with zodResolver
  - [ ] DaisyUI form styling consistent with LoginForm

- [ ] Task 6: Create ResetPasswordForm component (AC: 2, 4, 5, 6, 7)
  - [ ] Create `src/features/auth/components/ResetPasswordForm.tsx`
  - [ ] New password input field
  - [ ] Confirm password input field
  - [ ] Submit button with loading state
  - [ ] Use React Hook Form with zodResolver
  - [ ] Show/hide password toggle (consistent with RegisterForm)
  - [ ] DaisyUI form styling consistent with RegisterForm

- [ ] Task 7: Create ForgotPasswordPage (AC: 1, 3, 9)
  - [ ] Create `src/features/auth/pages/ForgotPasswordPage.tsx`
  - [ ] Page layout consistent with LoginPage
  - [ ] Include ForgotPasswordForm component
  - [ ] "Back to login" link
  - [ ] PassportCard branding

- [ ] Task 8: Create ResetPasswordPage (AC: 2, 4, 5)
  - [ ] Create `src/features/auth/pages/ResetPasswordPage.tsx`
  - [ ] Page layout consistent with LoginPage
  - [ ] Include ResetPasswordForm component
  - [ ] Handle auth token from URL (Supabase magic link)
  - [ ] Redirect to login if no valid session/token
  - [ ] Show error if token is invalid/expired

- [ ] Task 9: Add routes for password reset flow (AC: 1, 2)
  - [ ] Add `/forgot-password` route in `src/routes/index.tsx`
  - [ ] Add `/reset-password` route (for magic link callback)
  - [ ] Configure Supabase Auth redirect URL to point to `/reset-password`

- [ ] Task 10: Add "Forgot Password" link to LoginPage (AC: 9)
  - [ ] Update `src/features/auth/pages/LoginPage.tsx`
  - [ ] Add link below login form: "Forgot your password?"
  - [ ] Link to `/forgot-password`

- [ ] Task 11: Update LoginPage for password reset success message (AC: 2)
  - [ ] Check for `?reset=success` query parameter
  - [ ] Display success alert when password was reset
  - [ ] Clear the query param after showing message

- [ ] Task 12: Update barrel exports (AC: N/A)
  - [ ] Export ForgotPasswordForm from `src/features/auth/index.ts`
  - [ ] Export ResetPasswordForm from `src/features/auth/index.ts`
  - [ ] Export ForgotPasswordPage from `src/features/auth/index.ts`
  - [ ] Export ResetPasswordPage from `src/features/auth/index.ts`
  - [ ] Export useForgotPassword hook
  - [ ] Export useResetPassword hook
  - [ ] Export new schemas and types

- [ ] Task 13: Test password reset flow (AC: 1-9)
  - [ ] Test forgot password form validation
  - [ ] Test email submission shows success message
  - [ ] Test unregistered email shows same success (no enumeration)
  - [ ] Test password reset email is received (manual Supabase check)
  - [ ] Test reset link opens ResetPasswordPage
  - [ ] Test new password validation (min 8 chars)
  - [ ] Test password confirmation must match
  - [ ] Test successful reset redirects to login with message
  - [ ] Test expired/invalid token shows error
  - [ ] Test all links work (back to login, etc.)

## Dev Notes

### Architecture Patterns (MANDATORY)

**Feature Folder Structure (Extending from Stories 1.4, 1.5, 1.6):**
```
src/features/auth/
├── components/
│   ├── RegisterForm.tsx          (Story 1.4 - EXISTING)
│   ├── LoginForm.tsx             (Story 1.5 - EXISTING)
│   ├── LogoutButton.tsx          (Story 1.6 - EXISTING)
│   ├── UserMenu.tsx              (Story 1.6 - EXISTING)
│   ├── SessionExpiredHandler.tsx (Story 1.6 - EXISTING)
│   ├── ForgotPasswordForm.tsx    (NEW)
│   ├── ResetPasswordForm.tsx     (NEW)
│   └── AuthGuard.tsx             (Story 1.8)
├── hooks/
│   ├── useAuth.ts                (EXISTING)
│   ├── useRegister.ts            (Story 1.4 - EXISTING)
│   ├── useLogin.ts               (Story 1.5 - EXISTING)
│   ├── useSession.ts             (Story 1.6 - EXISTING)
│   ├── useForgotPassword.ts      (NEW)
│   └── useResetPassword.ts       (NEW)
├── pages/
│   ├── RegisterPage.tsx          (Story 1.4 - EXISTING)
│   ├── LoginPage.tsx             (UPDATE - add forgot password link, reset success message)
│   ├── ForgotPasswordPage.tsx    (NEW)
│   └── ResetPasswordPage.tsx     (NEW)
├── services/
│   └── authService.ts            (UPDATE - add password reset methods)
├── schemas/
│   └── authSchemas.ts            (UPDATE - add password reset schemas)
├── types.ts                      (EXISTING)
└── index.ts                      (UPDATE barrel exports)
```

### Zod Schemas (src/features/auth/schemas/authSchemas.ts)

Add these schemas to the existing file:

```typescript
import { z } from 'zod';

// ... existing registerSchema and loginSchema ...

// Forgot password - just needs email
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password - new password with confirmation
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
```

### Auth Service Extension (src/features/auth/services/authService.ts)

Add these methods to the existing authService:

```typescript
import { supabase } from '../../../lib/supabase';
import type { ServiceResponse } from '../../../types';

export const authService = {
  // ... existing register, login, signOut, getCurrentUser methods ...

  async requestPasswordReset(email: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset request error:', error);
        // Don't expose if email exists or not - security best practice
        // Still return success to prevent email enumeration
        return { data: null, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      // Still return success - don't reveal if email exists
      return { data: null, error: null };
    }
  },

  async updatePassword(newPassword: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        return {
          data: null,
          error: {
            message: error.message || 'Failed to update password',
            code: 'AUTH_PASSWORD_UPDATE_ERROR',
          },
        };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Unexpected password update error:', error);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred',
          code: 'AUTH_UNEXPECTED_ERROR',
        },
      };
    }
  },
};
```

### useForgotPassword Hook (src/features/auth/hooks/useForgotPassword.ts)

```typescript
import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

interface ForgotPasswordState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useForgotPassword() {
  const [state, setState] = useState<ForgotPasswordState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const requestReset = useCallback(async (email: string) => {
    setState({ isLoading: true, isSuccess: false, error: null });

    try {
      await authService.requestPasswordReset(email);
      
      // Always show success regardless of whether email exists
      // This is a security best practice to prevent email enumeration
      setState({ isLoading: false, isSuccess: true, error: null });
    } catch (error) {
      // Even on error, show success to prevent enumeration
      console.error('Password reset error:', error);
      setState({ isLoading: false, isSuccess: true, error: null });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, isSuccess: false, error: null });
  }, []);

  return {
    ...state,
    requestReset,
    reset,
  };
}
```

### useResetPassword Hook (src/features/auth/hooks/useResetPassword.ts)

```typescript
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ResetPasswordState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export function useResetPassword() {
  const [state, setState] = useState<ResetPasswordState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });
  const navigate = useNavigate();

  const updatePassword = useCallback(async (newPassword: string) => {
    setState({ isLoading: true, isSuccess: false, error: null });

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.error) {
        setState({
          isLoading: false,
          isSuccess: false,
          error: result.error.message,
        });
        return;
      }

      setState({ isLoading: false, isSuccess: true, error: null });
      
      // Redirect to login with success message
      navigate('/login?reset=success');
    } catch (error) {
      console.error('Password update error:', error);
      setState({
        isLoading: false,
        isSuccess: false,
        error: 'An unexpected error occurred. Please try again.',
      });
    }
  }, [navigate]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    updatePassword,
    clearError,
  };
}
```

### ForgotPasswordForm Component (src/features/auth/components/ForgotPasswordForm.tsx)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/authSchemas';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordForm() {
  const { isLoading, isSuccess, requestReset, reset } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await requestReset(data.email);
  };

  // Show success state
  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="alert alert-success">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Check your email for reset instructions</span>
        </div>
        <p className="text-sm text-base-content/70 text-center">
          If an account exists with that email, we've sent password reset instructions.
          Please check your inbox and spam folder.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={reset}
            className="btn btn-ghost btn-sm"
          >
            Send another email
          </button>
          <Link to="/login" className="btn btn-primary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-base-content/70 mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {/* Email Field */}
      <div className="form-control">
        <label className="label" htmlFor="email">
          <span className="label-text">Email address</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
          {...register('email')}
          disabled={isLoading}
          autoComplete="email"
          autoFocus
        />
        {errors.email && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.email.message}</span>
          </label>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      {/* Back to Login Link */}
      <div className="text-center">
        <Link to="/login" className="link link-primary text-sm">
          Back to Login
        </Link>
      </div>
    </form>
  );
}
```

### ResetPasswordForm Component (src/features/auth/components/ResetPasswordForm.tsx)

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/authSchemas';
import { useResetPassword } from '../hooks/useResetPassword';

export function ResetPasswordForm() {
  const { isLoading, error, updatePassword, clearError } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    await updatePassword(data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-base-content/70 mb-4">
        Enter your new password below.
      </p>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
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
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* New Password Field */}
      <div className="form-control">
        <label className="label" htmlFor="password">
          <span className="label-text">New Password</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
            {...register('password')}
            disabled={isLoading}
            autoComplete="new-password"
            autoFocus
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt text-base-content/60">
            Minimum 8 characters
          </span>
        </label>
      </div>

      {/* Confirm Password Field */}
      <div className="form-control">
        <label className="label" htmlFor="confirmPassword">
          <span className="label-text">Confirm New Password</span>
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            className={`input input-bordered w-full pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
            {...register('confirmPassword')}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
          </label>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Updating Password...
          </>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );
}
```

### ForgotPasswordPage (src/features/auth/pages/ForgotPasswordPage.tsx)

```typescript
import { Navigate } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { useAuth } from '../hooks/useAuth';

export function ForgotPasswordPage() {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold justify-center mb-2">
            Forgot Password?
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            No worries, we'll help you reset it
          </p>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
```

### ResetPasswordPage (src/features/auth/pages/ResetPasswordPage.tsx)

```typescript
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../../lib/supabase';

export function ResetPasswordPage() {
  const { isLoading } = useAuth();
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if we have a valid session from the magic link
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Supabase sets a session when user clicks the reset link
        // The session will have the recovery token
        setHasValidSession(!!session);
      } catch (error) {
        console.error('Error checking session:', error);
        setHasValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    // Listen for auth state changes (magic link will trigger SIGNED_IN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked the recovery link
          setHasValidSession(true);
          setCheckingSession(false);
        }
      }
    );

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading while checking session
  if (isLoading || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // No valid session - show error
  if (!hasValidSession) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold justify-center mb-2">
              Invalid or Expired Link
            </h1>
            <div className="alert alert-warning mb-4">
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
              <span>This password reset link is invalid or has expired.</span>
            </div>
            <p className="text-sm text-base-content/70 text-center mb-4">
              Password reset links expire after a short time for security reasons.
              Please request a new link.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/forgot-password" className="btn btn-primary">
                Request New Link
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold justify-center mb-2">
            Reset Your Password
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Choose a strong password for your account
          </p>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
```

### Update LoginPage (src/features/auth/pages/LoginPage.tsx)

Add forgot password link and reset success message:

```typescript
// Add to existing LoginPage component:

// In useEffect, check for reset success param:
useEffect(() => {
  // Check for expired query param (existing code)
  if (searchParams.get('expired') === 'true') {
    setShowExpiredMessage(true);
    searchParams.delete('expired');
    setSearchParams(searchParams, { replace: true });
  }
  
  // NEW: Check for reset success param
  if (searchParams.get('reset') === 'success') {
    setShowResetSuccessMessage(true);
    searchParams.delete('reset');
    setSearchParams(searchParams, { replace: true });
  }
}, [searchParams, setSearchParams]);

// Add state for reset success:
const [showResetSuccessMessage, setShowResetSuccessMessage] = useState(false);

// Add success alert in JSX (before LoginForm):
{showResetSuccessMessage && (
  <div className="alert alert-success mb-4">
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>Password reset successful! Please log in with your new password.</span>
    <button
      onClick={() => setShowResetSuccessMessage(false)}
      className="btn btn-sm btn-ghost"
      aria-label="Dismiss"
    >
      ✕
    </button>
  </div>
)}

// Add forgot password link after LoginForm:
<div className="text-center mt-4">
  <Link to="/forgot-password" className="link link-primary text-sm">
    Forgot your password?
  </Link>
</div>
```

### Route Configuration (src/routes/index.tsx)

Add routes for password reset:

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '../features/auth';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Protected routes - Story 1.8 */}
      {/* ... */}
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
```

### Updated Barrel Export (src/features/auth/index.ts)

```typescript
// Components
export { RegisterForm } from './components/RegisterForm';
export { LoginForm } from './components/LoginForm';
export { LogoutButton } from './components/LogoutButton';
export { UserMenu } from './components/UserMenu';
export { SessionExpiredHandler } from './components/SessionExpiredHandler';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { ResetPasswordForm } from './components/ResetPasswordForm';

// Pages
export { RegisterPage } from './pages/RegisterPage';
export { LoginPage } from './pages/LoginPage';
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { ResetPasswordPage } from './pages/ResetPasswordPage';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useRegister } from './hooks/useRegister';
export { useLogin } from './hooks/useLogin';
export { useSession } from './hooks/useSession';
export { useForgotPassword } from './hooks/useForgotPassword';
export { useResetPassword } from './hooks/useResetPassword';

// Services
export { authService } from './services/authService';

// Schemas
export {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './schemas/authSchemas';
export type {
  RegisterFormData,
  LoginFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from './schemas/authSchemas';

// Types
export type * from './types';
```

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Components | `PascalCase` | `ForgotPasswordForm`, `ResetPasswordForm` |
| Files | `PascalCase.tsx` | `ForgotPasswordForm.tsx` |
| Pages | `PascalCase` + `Page` suffix | `ForgotPasswordPage`, `ResetPasswordPage` |
| Hooks | `use` + `PascalCase` | `useForgotPassword`, `useResetPassword` |
| Services | `camelCase` | `authService.requestPasswordReset()` |
| Schemas | `camelCase` + `Schema` suffix | `forgotPasswordSchema`, `resetPasswordSchema` |

### Anti-Patterns to AVOID

1. **DO NOT** reveal if an email exists in the system - always show success message for password reset requests (prevents email enumeration attacks)
2. **DO NOT** call Supabase directly from components - use service layer
3. **DO NOT** show detailed error messages for security-sensitive operations
4. **DO NOT** skip password confirmation field validation
5. **DO NOT** allow weak passwords (enforce minimum 8 characters)
6. **DO NOT** store password reset tokens in localStorage
7. **DO NOT** redirect before session is properly checked

### Supabase Auth Password Reset Flow

**How Supabase Password Reset Works:**
1. User requests password reset → `resetPasswordForEmail()` sends email
2. Email contains magic link with token pointing to your `redirectTo` URL
3. When user clicks link, Supabase exchanges token for session
4. User is now authenticated with a special recovery session
5. Call `updateUser({ password })` to set new password
6. User can now log in with new password

**Important Configuration:**
- The `redirectTo` URL MUST be configured in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
- Add both dev (`http://localhost:5173/reset-password`) and production URLs

**Session Detection:**
- Supabase fires `PASSWORD_RECOVERY` event when magic link is clicked
- The session established is a "recovery" session
- After password update, user should log in fresh

### Previous Story Learnings Applied

From **Story 1.4** (Registration Flow):
- Form validation with Zod + React Hook Form pattern
- Service layer pattern with `ServiceResponse<T>`
- Password show/hide toggle implementation
- Loading state management

From **Story 1.5** (Login Flow):
- Page layout consistency (card-based centered layout)
- Query parameter handling for messages
- Redirect logic when already authenticated
- Navigation after successful action

From **Story 1.6** (Logout & Session):
- `onAuthStateChange` event handling
- Session state management patterns
- Security-conscious error handling

### Testing Checklist

- [ ] Navigate to /forgot-password page
- [ ] Form shows email input field
- [ ] Submit with invalid email shows validation error
- [ ] Submit with valid email shows success message
- [ ] Success message shown even for non-existent emails (security)
- [ ] "Back to Login" link works
- [ ] "Send another email" button resets form
- [ ] Check Supabase logs for email being sent
- [ ] Click reset link in email → opens /reset-password
- [ ] Invalid/expired token shows error with "Request New Link" option
- [ ] Valid token shows password reset form
- [ ] Password field validates minimum 8 characters
- [ ] Password confirmation must match
- [ ] Show/hide password toggles work
- [ ] Successful reset redirects to login with success message
- [ ] Can log in with new password
- [ ] Login page shows "Forgot your password?" link
- [ ] Link navigates to /forgot-password

### Environment Configuration

Ensure Supabase is configured with the correct redirect URL:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to "Redirect URLs":
   - `http://localhost:5173/reset-password` (development)
   - `https://your-domain.com/reset-password` (production)

### Dependencies on Previous Stories

- **Story 1.1:** ✅ Project initialized with React Router, Zod, React Hook Form
- **Story 1.2:** ✅ PassportCard DaisyUI theme configured
- **Story 1.3:** ✅ Supabase Auth configured
- **Story 1.4:** ✅ Registration patterns established (form, service, hook)
- **Story 1.5:** ✅ Login page patterns, useAuth hook
- **Story 1.6:** ✅ Session management patterns

### Next Story Dependencies

- **Story 1.8 (Protected Routes):** Uses auth state from useAuth
- **Story 1.9 (Application Shell):** No direct dependency

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.7]
- [Source: _bmad-output/implementation-artifacts/1-4-user-registration-flow.md]
- [Source: _bmad-output/implementation-artifacts/1-5-user-login-flow.md]
- [Source: _bmad-output/implementation-artifacts/1-6-user-logout-and-session-management.md]
- [Supabase Auth resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
- [Supabase Auth updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser)
- [DaisyUI Form Components](https://daisyui.com/components/input/)
- [DaisyUI Alert Component](https://daisyui.com/components/alert/)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
