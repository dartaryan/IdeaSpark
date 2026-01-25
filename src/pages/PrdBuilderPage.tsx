import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePrdPageData } from '../features/prd/hooks/usePrdPageData';
import { usePrdBuilder } from '../features/prd/hooks/usePrdBuilder';
import { IdeaSummaryHeader } from '../features/prd/components/PrdBuilder/IdeaSummaryHeader';
import { PrdBuilderLayout } from '../features/prd/components/PrdBuilder/PrdBuilderLayout';
import { PrdPreview } from '../features/prd/components/PrdBuilder/PrdPreview';
import { ChatInterface } from '../features/prd/components/PrdBuilder/ChatInterface';
import { PrdBuilderSkeleton } from '../features/prd/components/PrdBuilder/PrdBuilderSkeleton';
import { PrdBuilderError } from '../features/prd/components/PrdBuilder/PrdBuilderError';
import { SaveIndicator, CompletionValidationModal } from '../features/prd/components';

export function PrdBuilderPage() {
  const { id } = useParams<{ id: string }>();
  
  // Completion validation modal state (must be before early returns)
  const [showValidationModal, setShowValidationModal] = useState(false);
  
  const {
    idea,
    prd,
    isLoading,
    error,
    isIdeaNotFound,
    isIdeaNotApproved,
    isCreatingPrd,
  } = usePrdPageData(id);

  // Loading state
  if (isLoading || isCreatingPrd) {
    return <PrdBuilderSkeleton />;
  }

  // Idea not found
  if (isIdeaNotFound) {
    return <PrdBuilderError type="not-found" />;
  }

  // Idea not approved
  if (isIdeaNotApproved) {
    return <PrdBuilderError type="not-approved" ideaId={id} />;
  }

  // Generic error
  if (error) {
    return <PrdBuilderError type="error" message={error.message} />;
  }

  // Main content
  if (!idea || !prd) return null;

  // Use usePrdBuilder hook for section state management with auto-save
  const {
    prdContent,
    highlightedSections,
    saveStatus,
    lastSaved,
    saveError,
    handleSectionUpdates,
    triggerSave,
    clearSaveError,
    completionValidation,
    focusOnSection,
  } = usePrdBuilder({
    prdId: prd.id,
    initialContent: prd.content,
  });

  // Prepare idea context for ChatInterface
  const ideaContext = {
    id: idea.id,
    title: idea.title || undefined,
    problem: idea.problem,
    solution: idea.solution,
    impact: idea.impact,
    enhancedProblem: idea.enhanced_problem || undefined,
    enhancedSolution: idea.enhanced_solution || undefined,
    enhancedImpact: idea.enhanced_impact || undefined,
  };

  return (
    <div className="h-full">
      <div className="border-b border-base-300 bg-base-100">
        <div className="flex items-center justify-between px-4 py-2">
          <IdeaSummaryHeader idea={idea} />
          <div className="flex items-center gap-2">
            <SaveIndicator
              saveStatus={saveStatus}
              lastSaved={lastSaved}
              error={saveError}
              onManualSave={triggerSave}
              onRetry={triggerSave}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                if (completionValidation.isReady) {
                  // TODO: Story 3.8 - Mark PRD as complete
                  console.log('PRD is ready to be marked complete');
                } else {
                  setShowValidationModal(true);
                }
              }}
            >
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <PrdBuilderLayout
          chatPanel={
            <ChatInterface
              prdId={prd.id}
              ideaContext={ideaContext}
              prdContent={prdContent}
              onSectionUpdate={handleSectionUpdates}
            />
          }
          previewPanel={
            <PrdPreview
              prdContent={prdContent}
              highlightedSections={highlightedSections}
              ideaTitle={idea.title || idea.problem.substring(0, 50)}
              isSaving={saveStatus === 'saving'}
              lastSaved={lastSaved}
              onSectionFocus={focusOnSection}
            />
          }
        />
      </div>

      {/* Completion Validation Modal */}
      <CompletionValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        validation={completionValidation}
        onFocusSection={(sectionKey) => {
          focusOnSection(sectionKey);
          setShowValidationModal(false);
        }}
      />
    </div>
  );
}
