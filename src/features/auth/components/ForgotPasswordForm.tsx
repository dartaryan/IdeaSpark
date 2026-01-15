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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <label className="label" id="email-error">
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
