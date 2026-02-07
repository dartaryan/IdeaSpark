// src/features/prototypes/components/ShareButton.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useSharePrototype } from '../hooks/useSharePrototype';
import { useShareStats } from '../hooks/useShareStats';
import { prototypeService } from '../services/prototypeService';

interface ShareButtonProps {
  prototypeId: string;
  prdId: string;
}

/** Query keys for existing share URL lookup */
const shareUrlKeys = {
  detail: (prototypeId: string) => ['shareUrl', prototypeId] as const,
};

export function ShareButton({ prototypeId, prdId }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareMutation = useSharePrototype();
  const { data: shareStats } = useShareStats(prototypeId);

  // Check if prototype is already shared (React Query for caching & consistency)
  const { data: existingShareUrl } = useQuery({
    queryKey: shareUrlKeys.detail(prototypeId),
    queryFn: async () => {
      const result = await prototypeService.getShareUrl(prototypeId);
      return result.data ?? null;
    },
    enabled: !!prototypeId,
  });

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

  const shareUrl = existingShareUrl || shareMutation.data;

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

                {/* Section 3: Stats */}
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
