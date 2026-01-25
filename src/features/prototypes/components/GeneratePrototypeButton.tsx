import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useGeneratePrototype } from '../hooks/useGeneratePrototype';

interface GeneratePrototypeButtonProps {
  prdId: string;
  ideaId: string;
  existingPrototypeId?: string;
  onGenerationStart?: () => void;
  onGenerationComplete?: (prototypeId: string) => void;
}

export function GeneratePrototypeButton({
  prdId,
  ideaId,
  existingPrototypeId,
  onGenerationStart,
  onGenerationComplete,
}: GeneratePrototypeButtonProps) {
  const navigate = useNavigate();
  const [showRegenerate, setShowRegenerate] = useState(false);

  const { generate, isGenerating, error, retry } = useGeneratePrototype({
    onSuccess: (prototypeId) => {
      onGenerationComplete?.(prototypeId);
      // Navigate to prototype viewer
      navigate(`/prototypes/${prototypeId}`);
    },
  });

  const handleGenerate = async () => {
    onGenerationStart?.();
    await generate(prdId, ideaId);
  };

  const handleRetry = () => {
    retry();
  };

  // If prototype exists, show "View Prototype" with regenerate option
  if (existingPrototypeId && !showRegenerate) {
    return (
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/prototypes/${existingPrototypeId}`)}
          className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <RocketLaunchIcon className="w-6 h-6" />
          View Prototype
        </button>
        <button
          onClick={() => setShowRegenerate(true)}
          className="btn btn-outline btn-lg"
        >
          Regenerate
        </button>
      </div>
    );
  }

  // Show generate button
  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
      >
        {isGenerating ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Generating Prototype...
          </>
        ) : (
          <>
            <RocketLaunchIcon className="w-6 h-6" />
            Generate Prototype
          </>
        )}
      </button>

      {/* Show error with retry option */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <div className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
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
            <span>{error.message}</span>
          </div>
          <div className="flex-none">
            <button onClick={handleRetry} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
