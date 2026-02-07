import { useState, useEffect } from 'react';

interface DevicePreset {
  id: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
}

interface PrototypeFrameProps {
  url: string;
  device: DevicePreset;
  className?: string;
}

export function PrototypeFrame({ url, device, className = '' }: PrototypeFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true);
    setHasError(false);
    setLoadTimeout(false);

    // Set timeout for iframe load (10 seconds) - AC 6
    const timeout = setTimeout(() => {
      setLoadTimeout(true);
      setIsLoading(false);
    }, 10000);

    return () => clearTimeout(timeout);
    // Only re-run when URL changes, not when isLoading changes (avoids infinite loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Calculate scale for responsive display
  const containerMaxWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 1200;
  const scale = device.id === 'desktop' 
    ? Math.min(containerMaxWidth / device.width, 1)
    : 1;

  return (
    <div className={`relative ${className}`}>
      {/* Loading State - AC 6 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-200 rounded-lg">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg" role="status"></span>
            <p className="mt-4 text-base-content/70">Loading prototype...</p>
          </div>
        </div>
      )}

      {/* Error State - AC 7 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-200 rounded-lg">
          <div className="text-center p-8">
            <div className="text-error text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Failed to Load Prototype</h3>
            <p className="text-base-content/70 mb-4">
              The prototype could not be loaded. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Timeout State - AC 6 */}
      {loadTimeout && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-200 rounded-lg">
          <div className="text-center p-8">
            <div className="text-warning text-5xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold mb-2">Loading Taking Longer Than Expected</h3>
            <p className="text-base-content/70 mb-4">
              The prototype is taking a while to load. This might be due to network issues.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Device Frame Container - AC 2, 3 */}
      <div 
        className="mx-auto transition-all duration-300 ease-in-out"
        style={{
          width: device.id === 'desktop' ? '100%' : `${device.width}px`,
          maxWidth: '100%',
        }}
      >
        {/* Device Frame Border (for tablet/mobile) - AC 3 */}
        <div 
          className={`
            relative overflow-hidden rounded-lg
            ${device.id === 'mobile' ? 'border-8 border-base-300 rounded-[40px] shadow-2xl' : ''}
            ${device.id === 'tablet' ? 'border-4 border-base-300 rounded-[20px] shadow-xl' : ''}
            ${device.id === 'desktop' ? 'border border-base-300 shadow-lg' : ''}
          `}
          style={{
            transform: device.id === 'desktop' ? `scale(${scale})` : 'none',
            transformOrigin: 'top center',
          }}
        >
          {/* Iframe - AC 1, Task 7 (sandbox security) */}
          <iframe
            src={url}
            title="Prototype Preview"
            className="w-full bg-white"
            style={{
              height: device.id === 'desktop' ? `${device.height * scale}px` : `${device.height}px`,
              border: 'none',
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        </div>

        {/* Device Frame Notch (for mobile) - AC 3 */}
        {device.id === 'mobile' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-base-300 rounded-b-2xl" />
        )}
      </div>
    </div>
  );
}
