// src/features/prototypes/components/RefinementChat.tsx

import { useState } from 'react';
import { useRefinePrototype } from '../hooks/useRefinePrototype';

interface RefinementChatProps {
  prototypeId: string;
  onRefinementComplete: (newPrototypeId: string) => void;
}

export function RefinementChat({ prototypeId, onRefinementComplete }: RefinementChatProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const refineMutation = useRefinePrototype();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (prompt.trim().length < 10) {
      setError('Please provide more detail (at least 10 characters)');
      return;
    }

    if (prompt.trim().length > 500) {
      setError('Refinement request too long (max 500 characters)');
      return;
    }

    try {
      const result = await refineMutation.mutateAsync({
        prototypeId,
        refinementPrompt: prompt.trim(),
      });

      // Success - notify parent component
      onRefinementComplete(result.prototypeId);
      setPrompt(''); // Clear input
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refinement failed. Please try again.');
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  const isLoading = refineMutation.isPending;
  const charCount = prompt.length;
  const isValid = charCount >= 10 && charCount <= 500;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-lg">Refine Your Prototype</h3>
        <p className="text-sm text-base-content/70">
          Describe what you'd like to change (e.g., "Make the header larger" or "Add a sidebar")
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <textarea
              className="textarea textarea-bordered h-24 resize-none"
              placeholder="Describe your refinement..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              maxLength={500}
            />
            <label className="label">
              <span className={`label-text-alt ${!isValid && charCount > 0 ? 'text-error' : ''}`}>
                {charCount < 10 ? `${10 - charCount} more characters needed` : `${charCount}/500`}
              </span>
            </label>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-ghost" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Refining Prototype...
              </>
            ) : (
              'Refine Prototype'
            )}
          </button>
        </form>

        {isLoading && (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Generating refined prototype... This may take up to 10 seconds.</span>
          </div>
        )}
      </div>
    </div>
  );
}
