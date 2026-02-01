import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePrdView } from '../features/prd/hooks/usePrdView';
import {
  PrdDocumentView,
  PrdViewerHeader,
  PrdIdeaSummary,
} from '../features/prd/components';
import {
  GeneratePrototypeButton,
  GenerationProgress,
  useGeneratePrototype,
} from '../features/prototypes';
import { supabase } from '../lib/supabase';

export function PrdViewPage() {
  const { prdId } = useParams<{ prdId: string }>();
  console.log('[PrdViewPage] RENDER with prdId:', prdId, 'URL:', window.location.href);
  
  const { data, isLoading, error, isDraft } = usePrdView({
    prdId: prdId ?? '',
    redirectIfDraft: true,
  });
  
  console.log('[PrdViewPage] usePrdView result:', { data: !!data, isLoading, error, isDraft });
  const [existingPrototypeId, setExistingPrototypeId] = useState<string>();
  const { isGenerating, startTime } = useGeneratePrototype();

  // Check if prototype already exists
  useEffect(() => {
    const checkExistingPrototype = async () => {
      if (!prdId) return;

      const { data: prototypeData } = await supabase
        .from('prototypes')
        .select('id, status')
        .eq('prd_id', prdId)
        .eq('status', 'ready')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prototypeData) {
        setExistingPrototypeId(prototypeData.id);
      }
    };

    checkExistingPrototype();
  }, [prdId, isGenerating]); // Re-check when generation completes

  if (isLoading || isDraft) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-semibold text-error">PRD Not Found</h2>
        <p className="text-base-content/60">
          {error?.message || 'The requested PRD could not be found.'}
        </p>
        <a href="/ideas" className="btn btn-primary">
          Back to My Ideas
        </a>
      </div>
    );
  }

  const { prd, idea } = data;
  const isPrdComplete = prd.status === 'complete';
  
  console.log('[PrdViewPage] PRD data:', { 
    prdId: prd.id, 
    ideaId: prd.idea_id, 
    status: prd.status,
    isPrdComplete 
  });

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <PrdViewerHeader prd={prd} idea={idea} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Idea Summary (Collapsible) */}
        <PrdIdeaSummary idea={idea} />

        {/* PRD Document */}
        <PrdDocumentView prdContent={prd.content} />

        {/* Generation Progress (shown during generation) */}
        {isGenerating && (
          <div className="mt-8">
            <GenerationProgress status="generating" startTime={startTime} />
          </div>
        )}

        {/* Generate Prototype Button (shown when PRD is complete) */}
        {isPrdComplete && (
          <div className="mt-8">
            <div className="card bg-primary/10 border-2 border-primary shadow-xl">
              <div className="card-body text-center">
                <h2 className="card-title text-2xl justify-center mb-4">
                  Ready to See Your Idea Come to Life?
                </h2>
                <p className="mb-6 text-base-content/80">
                  Generate a fully functional React prototype with PassportCard
                  branding
                </p>
                <GeneratePrototypeButton
                  prdId={prd.id}
                  ideaId={prd.idea_id}
                  existingPrototypeId={existingPrototypeId}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
