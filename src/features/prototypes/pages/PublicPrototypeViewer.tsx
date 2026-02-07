// src/features/prototypes/pages/PublicPrototypeViewer.tsx

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicPrototype } from '../hooks/usePublicPrototype';

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const DEVICE_SIZES = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', label: 'Mobile' },
};

export function PublicPrototypeViewer() {
  const { shareId } = useParams<{ shareId: string }>();
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  
  const { data: prototype, isLoading, error } = usePublicPrototype(shareId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/70">Loading prototype...</p>
        </div>
      </div>
    );
  }

  if (error || !prototype) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
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
            Created {new Date(prototype.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
