// src/features/prototypes/pages/PasswordProtectedViewer.tsx

import { useState } from 'react';
import { useVerifyPrototypePassword } from '../hooks/useVerifyPrototypePassword';

interface PasswordProtectedViewerProps {
  shareId: string;
  onVerified: () => void;
}

/**
 * Password entry page shown when a public prototype is password-protected.
 * Verifies password via Edge Function and stores verified state in sessionStorage.
 */
export function PasswordProtectedViewer({ shareId, onVerified }: PasswordProtectedViewerProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyMutation = useVerifyPrototypePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setErrorMessage(null);

    verifyMutation.mutate(
      { shareId, password },
      {
        onSuccess: (result) => {
          if (result.verified) {
            // Store verified state in sessionStorage (expires when browser closes)
            sessionStorage.setItem(`verified_prototype_${shareId}`, 'true');
            onVerified();
          } else {
            setErrorMessage('Incorrect password');
            setPassword('');
          }
        },
        onError: (error) => {
          setErrorMessage(error.message || 'Authentication error. Please try again.');
          setPassword('');
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
        <div className="card-body text-center">
          {/* Lock Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>

          <h2 className="card-title justify-center mt-4">
            This prototype is password protected
          </h2>
          <p className="text-base-content/70 mb-4">
            Enter the password to view this prototype.
          </p>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className={`input input-bordered w-full pr-12 ${errorMessage ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  autoFocus
                  data-testid="verify-password-input"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <label className="label">
                  <span className="label-text-alt text-error" data-testid="password-error">
                    {errorMessage}
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!password.trim() || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Verifying...
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
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  Unlock
                </>
              )}
            </button>
          </form>

          {/* Helper text */}
          <p className="text-xs text-base-content/50 mt-4">
            Forgot password? Contact the person who shared this link.
          </p>

          {/* Branding */}
          <div className="divider"></div>
          <p className="text-xs text-base-content/50">
            Powered by{' '}
            <a href="/" className="link link-primary">
              IdeaSpark
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
