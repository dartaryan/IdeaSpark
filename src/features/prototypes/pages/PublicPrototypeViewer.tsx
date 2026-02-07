// src/features/prototypes/pages/PublicPrototypeViewer.tsx

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicPrototype } from '../hooks/usePublicPrototype';
import { prototypeService } from '../services/prototypeService';
import { PasswordProtectedViewer } from './PasswordProtectedViewer';

type DeviceSize = 'desktop' | 'tablet' | 'mobile';
type LinkStatus = 'loading' | 'expired' | 'revoked' | 'not_found' | 'not_public' | 'valid' | 'error';

const DEVICE_SIZES = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', label: 'Mobile' },
};

export function PublicPrototypeViewer() {
  const { shareId } = useParams<{ shareId: string }>();
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [passwordVerified, setPasswordVerified] = useState(() => {
    // Check sessionStorage for previously verified state
    if (shareId) {
      return sessionStorage.getItem(`verified_prototype_${shareId}`) === 'true';
    }
    return false;
  });
  const [linkStatus, setLinkStatus] = useState<LinkStatus>('loading');

  const { data: prototype, isLoading, error } = usePublicPrototype(shareId);

  // When the prototype fetch fails, check the link status to determine why
  useEffect(() => {
    let isCancelled = false;

    if (isLoading) {
      setLinkStatus('loading');
      return;
    }

    if (prototype) {
      setLinkStatus('valid');
      return;
    }

    if ((error || !prototype) && shareId) {
      // Prototype not found via normal query — check link status via RPC
      prototypeService.checkShareLinkStatus(shareId).then((result) => {
        if (isCancelled) return; // Component unmounted or deps changed
        if (result.error || !result.data) {
          setLinkStatus('not_found');
        } else {
          setLinkStatus(result.data as LinkStatus);
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [prototype, isLoading, error, shareId]);

  const handlePasswordVerified = useCallback(() => {
    setPasswordVerified(true);
  }, []);

  if (isLoading || linkStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/70">Loading prototype...</p>
        </div>
      </div>
    );
  }

  // Expired link page
  if (linkStatus === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200" data-testid="expired-link-page">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-warning"
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
            <h2 className="card-title justify-center mt-4">Link Expired</h2>
            <p className="text-base-content/70">
              This shared prototype link has expired and is no longer accessible.
            </p>
            <p className="text-base-content/50 text-sm mt-2">
              Contact the person who shared this link to request a new one.
            </p>
            <div className="card-actions justify-center mt-4">
              <a href="/" className="btn btn-primary">
                Go to IdeaSpark
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Revoked link page (future-proofing for Story 9.5)
  if (linkStatus === 'revoked') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200" data-testid="revoked-link-page">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            <h2 className="card-title justify-center mt-4">Access Revoked</h2>
            <p className="text-base-content/70">
              Access to this shared prototype has been revoked by the owner.
            </p>
            <div className="card-actions justify-center mt-4">
              <a href="/" className="btn btn-primary">
                Go to IdeaSpark
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !prototype) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200" data-testid="not-found-page">
        <div className="card bg-base-100 shadow-xl max-w-md">
          <div className="card-body text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="card-title justify-center mt-4">Prototype Not Found</h2>
            <p className="text-base-content/70">
              This prototype link is invalid or has been removed.
            </p>
            <div className="card-actions justify-center mt-4">
              <a href="/" className="btn btn-primary">
                Go to IdeaSpark
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if prototype is password-protected and not yet verified
  if (prototype.hasPassword && !passwordVerified && shareId) {
    return (
      <PasswordProtectedViewer
        shareId={shareId}
        onVerified={handlePasswordVerified}
      />
    );
  }

  const currentSize = DEVICE_SIZES[deviceSize];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost normal-case text-xl">
            <img src="/logo-text-side.svg" alt="IdeaSpark" className="h-8" />
          </a>
          <span className="badge badge-ghost ml-2">View Only</span>
        </div>
        <div className="flex-none">
          <span className="badge badge-primary badge-lg mr-4">
            v{prototype.version}
          </span>
        </div>
      </div>

      {/* Device Size Selector */}
      <div className="bg-base-100 border-b border-base-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-base-content/70 mr-2">Device:</span>
            <div className="btn-group">
              {(Object.keys(DEVICE_SIZES) as DeviceSize[]).map((size) => (
                <button
                  key={size}
                  className={`btn btn-sm ${deviceSize === size ? 'btn-active' : ''}`}
                  onClick={() => setDeviceSize(size)}
                >
                  {DEVICE_SIZES[size].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prototype Preview */}
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[600px]">
          <div
            className="bg-base-100 shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
            style={{
              width: currentSize.width,
              height: deviceSize === 'desktop' ? '80vh' : currentSize.height,
              maxWidth: '100%',
            }}
          >
            {prototype.url ? (
              <iframe
                src={prototype.url}
                className="w-full h-full"
                title={`IdeaSpark Prototype - Version ${prototype.version}`}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-base-content/50">Preview not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-base-content/70">
          <p>
            This prototype was created with{' '}
            <a href="/" className="inline-flex items-center gap-1 link link-primary">
              <img src="/logo-icon.svg" alt="IdeaSpark" className="h-4 inline" />
              IdeaSpark
            </a>
          </p>
          <p className="mt-2">
            Created {new Date(prototype.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
