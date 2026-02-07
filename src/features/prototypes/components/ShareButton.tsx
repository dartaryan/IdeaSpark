// src/features/prototypes/components/ShareButton.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useSharePrototype } from '../hooks/useSharePrototype';
import { useShareStats } from '../hooks/useShareStats';
import { useSetSharePassword } from '../hooks/useSetSharePassword';
import { useSetShareExpiration } from '../hooks/useSetShareExpiration';
import { prototypeService } from '../services/prototypeService';
import {
  passwordSchema,
  calculatePasswordStrength,
  strengthBadgeClass,
  strengthLabel,
} from '../schemas/passwordSchemas';
import type { ExpirationDuration } from '../types';
import {
  calculateExpirationDate,
  getTimeRemaining,
  isExpired,
  formatExpirationDate,
} from '../utils/expirationUtils';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  prototypeId: string;
  prdId: string;
}

/** Query keys for existing share URL lookup */
const shareUrlKeys = {
  detail: (prototypeId: string) => ['shareUrl', prototypeId] as const,
};

/** Query keys for password status */
const passwordStatusKeys = {
  detail: (prototypeId: string) => ['passwordStatus', prototypeId] as const,
};

export function ShareButton({ prototypeId, prdId }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Password protection state
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Expiration state
  const [selectedExpiration, setSelectedExpiration] = useState<ExpirationDuration>('never');
  const [expirationTouched, setExpirationTouched] = useState(false);

  const shareMutation = useSharePrototype();
  const { data: shareStats } = useShareStats(prototypeId);
  const setPasswordMutation = useSetSharePassword();
  const setExpirationMutation = useSetShareExpiration();

  // Check if prototype is already shared (React Query for caching & consistency)
  const { data: existingShareUrl } = useQuery({
    queryKey: shareUrlKeys.detail(prototypeId),
    queryFn: async () => {
      const result = await prototypeService.getShareUrl(prototypeId);
      return result.data ?? null;
    },
    enabled: !!prototypeId,
  });

  // Check if prototype has password protection enabled
  const { data: hasPassword } = useQuery({
    queryKey: passwordStatusKeys.detail(prototypeId),
    queryFn: async () => {
      const result = await prototypeService.getPasswordStatus(prototypeId);
      return result.data ?? false;
    },
    enabled: !!prototypeId && !!existingShareUrl,
  });

  // Sync toggle state with server-side password status
  useEffect(() => {
    if (hasPassword !== undefined) {
      setPasswordEnabled(hasPassword);
    }
  }, [hasPassword]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const showCopiedFeedback = useCallback(() => {
    // Clear any existing timer before starting a new one
    if (copiedTimerRef.current) {
      clearTimeout(copiedTimerRef.current);
    }
    setCopied(true);
    copiedTimerRef.current = setTimeout(() => {
      setCopied(false);
      copiedTimerRef.current = null;
    }, 3000);
  }, []);

  const handleShare = async () => {
    if (existingShareUrl) {
      // Already shared, just show the URL
      setShowModal(true);
      return;
    }

    // Generate new share link
    try {
      await shareMutation.mutateAsync({ prototypeId, prdId });
      setShowModal(true);
      // The clipboard copy happens in useSharePrototype onSuccess.
      // Only show "Copied!" after verifying via the hook's success.
      showCopiedFeedback();
    } catch {
      // Show modal even on error so the user can see the error message and retry
      setShowModal(true);
    }
  };

  const handleCopyLink = async () => {
    const urlToCopy = existingShareUrl || shareMutation.data;
    if (!urlToCopy) return;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      showCopiedFeedback();
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleRetry = () => {
    shareMutation.reset();
    handleShare();
  };

  const handleTogglePassword = (enabled: boolean) => {
    if (!enabled && hasPassword) {
      // Confirmation dialog before removing password protection
      const confirmed = window.confirm(
        'Remove password protection? Anyone with the link will be able to access this prototype.'
      );
      if (!confirmed) return; // User cancelled, don't change toggle

      setPasswordEnabled(false);
      // Remove password protection
      setPasswordMutation.mutate(
        { prototypeId, password: null },
        {
          onSuccess: () => {
            toast.success('Password protection removed');
            setPasswordInput('');
          },
          onError: () => {
            toast.error('Failed to remove password protection');
            setPasswordEnabled(true); // Revert toggle
          },
        }
      );
    } else {
      setPasswordEnabled(enabled);
    }
  };

  const handleUpdatePassword = () => {
    const validation = passwordSchema.safeParse(passwordInput);
    if (!validation.success) return;

    setPasswordMutation.mutate(
      { prototypeId, password: passwordInput },
      {
        onSuccess: () => {
          toast.success('Password protection enabled');
          setPasswordInput('');
        },
        onError: () => {
          toast.error('Failed to set password');
        },
      }
    );
  };

  const handleUpdateExpiration = () => {
    const expiresAt = calculateExpirationDate(selectedExpiration);
    setExpirationMutation.mutate(
      { prototypeId, expiresAt },
      {
        onSuccess: () => {
          toast.success('Link expiration updated');
          setExpirationTouched(false); // Reset after successful update
        },
        onError: () => {
          toast.error('Failed to update link expiration');
        },
      }
    );
  };

  const shareUrl = existingShareUrl || shareMutation.data;
  const passwordValidation = passwordSchema.safeParse(passwordInput);
  const isPasswordValid = passwordValidation.success;
  const passwordStrength = passwordInput.length > 0
    ? calculatePasswordStrength(passwordInput)
    : null;

  // Derived expiration state
  const currentExpiresAt = shareStats?.expiresAt ?? null;
  const linkIsExpired = isExpired(currentExpiresAt);
  // Button enabled only after user explicitly interacts with the dropdown
  const expirationChanged = expirationTouched;

  return (
    <>
      <button
        className="btn btn-primary btn-sm gap-2"
        onClick={handleShare}
        disabled={shareMutation.isPending}
      >
        {shareMutation.isPending ? (
          <>
            <span className="loading loading-spinner loading-xs"></span>
            Generating...
          </>
        ) : (
          <>
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Publicly
          </>
        )}
      </button>

      {/* Share Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Share Prototype</h3>

            {/* Error State with Retry */}
            {shareMutation.isError && !shareUrl && (
              <div className="alert alert-error mb-4">
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
                <span>Failed to generate share link. Please try again.</span>
                <button className="btn btn-sm btn-ghost" onClick={handleRetry}>
                  Retry
                </button>
              </div>
            )}

            {/* Loading State - Optimistic UI skeleton */}
            {shareMutation.isPending && !shareUrl && (
              <div className="space-y-4 mb-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-base-300 rounded w-1/3 mb-2"></div>
                  <div className="h-10 bg-base-300 rounded w-full"></div>
                </div>
              </div>
            )}

            {/* Share URL Section */}
            {shareUrl && (
              <>
                <p className="text-sm text-base-content/70 mb-4">
                  Anyone with this link can view your prototype without logging in.
                </p>

                {/* Section 1: Shareable Link */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">Shareable Link</span>
                  </label>
                  <div className="join w-full">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="input input-bordered join-item flex-1 text-sm"
                    />
                    <button
                      className="btn btn-primary join-item"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Section 2: QR Code */}
                <div className="flex flex-col items-center mb-4 p-4 bg-base-200 rounded-lg">
                  <label className="label">
                    <span className="label-text font-medium">QR Code</span>
                  </label>
                  <div className="bg-white p-3 rounded-lg">
                    <QRCodeSVG value={shareUrl} size={150} />
                  </div>
                  <p className="text-xs text-base-content/50 mt-2">
                    Scan to open on mobile
                  </p>
                </div>

                {/* Section 3: Password Protection */}
                <div className="form-control mb-4 p-4 bg-base-200 rounded-lg">
                  <label className="label cursor-pointer">
                    <span className="label-text font-medium flex items-center gap-2">
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Password Protection
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={passwordEnabled}
                      onChange={(e) => handleTogglePassword(e.target.checked)}
                      disabled={setPasswordMutation.isPending}
                      data-testid="password-toggle"
                    />
                  </label>

                  {/* Password Input - shown when toggle is enabled */}
                  {passwordEnabled && (
                    <div className="mt-3 space-y-2">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password (min 8 characters)"
                          className="input input-bordered w-full pr-12"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          maxLength={72}
                          data-testid="password-input"
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

                      {/* Password Strength Indicator */}
                      {passwordStrength && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/70">Strength:</span>
                          <span
                            className={`badge badge-sm ${strengthBadgeClass[passwordStrength]}`}
                            data-testid="password-strength"
                          >
                            {strengthLabel[passwordStrength]}
                          </span>
                        </div>
                      )}

                      {/* Validation Error */}
                      {passwordInput.length > 0 && !isPasswordValid && (
                        <p className="text-xs text-error">
                          {(passwordValidation.error?.issues ?? passwordValidation.error?.errors)?.[0]?.message}
                        </p>
                      )}

                      {/* Update Password Button */}
                      <button
                        className="btn btn-sm btn-primary w-full"
                        onClick={handleUpdatePassword}
                        disabled={
                          !isPasswordValid ||
                          passwordInput.length === 0 ||
                          setPasswordMutation.isPending
                        }
                      >
                        {setPasswordMutation.isPending ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 4: Link Expiration */}
                <div className="form-control mb-4 p-4 bg-base-200 rounded-lg">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Link Expiration
                    </span>
                  </label>

                  <select
                    className="select select-bordered w-full"
                    value={selectedExpiration}
                    onChange={(e) => {
                      setSelectedExpiration(e.target.value as ExpirationDuration);
                      setExpirationTouched(true);
                    }}
                    data-testid="expiration-select"
                  >
                    <option value="never">Never expires</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>

                  {/* Current expiration info */}
                  {currentExpiresAt && (
                    <div className="mt-2 text-sm text-base-content/70" data-testid="expiration-info">
                      {linkIsExpired
                        ? (
                          <span className="text-error flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Link expired on {formatExpirationDate(currentExpiresAt)}
                          </span>
                        )
                        : (
                          <span>Expires: {formatExpirationDate(currentExpiresAt)} ({getTimeRemaining(currentExpiresAt).label})</span>
                        )
                      }
                    </div>
                  )}

                  {/* Expired warning badge */}
                  {linkIsExpired && (
                    <div className="badge badge-error gap-1 mt-2" data-testid="expired-badge">
                      Expired
                    </div>
                  )}

                  {/* Update button */}
                  <button
                    className="btn btn-sm btn-primary w-full mt-2"
                    onClick={handleUpdateExpiration}
                    disabled={!expirationChanged || setExpirationMutation.isPending}
                    data-testid="update-expiration-btn"
                  >
                    {setExpirationMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Updating...
                      </>
                    ) : (
                      'Update Expiration'
                    )}
                  </button>
                </div>

                {/* Section 5: Stats */}
                {shareStats && shareStats.isPublic && (
                  <div className="stats stats-horizontal shadow w-full mb-4">
                    <div className="stat place-items-center py-2">
                      <div className="stat-title text-xs">Views</div>
                      <div className="stat-value text-lg">{shareStats.viewCount}</div>
                    </div>
                    {shareStats.sharedAt && (
                      <div className="stat place-items-center py-2">
                        <div className="stat-title text-xs">Shared</div>
                        <div className="stat-value text-sm">
                          {new Date(shareStats.sharedAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {/* Expiration Stat */}
                    <div className="stat place-items-center py-2">
                      <div className="stat-title text-xs">Expires</div>
                      <div className="stat-value text-sm" data-testid="expiration-stat">
                        {currentExpiresAt
                          ? linkIsExpired
                            ? 'Expired'
                            : getTimeRemaining(currentExpiresAt).label
                          : 'Never'
                        }
                      </div>
                    </div>
                    {/* Password Protected Badge */}
                    {hasPassword && (
                      <div className="stat place-items-center py-2">
                        <div className="stat-title text-xs">Access</div>
                        <div className="stat-value text-sm flex items-center gap-1">
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
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          <span className="badge badge-sm badge-warning" data-testid="password-protected-badge">
                            Password Protected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Open in New Tab */}
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm w-full mb-4 gap-2"
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open in New Tab
                </a>
              </>
            )}

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}
