import { useParams, useNavigate } from 'react-router-dom';
import { usePrdPageData } from '../features/prd/hooks/usePrdPageData';
import { usePrdBuilder } from '../features/prd/hooks/usePrdBuilder';
import { useToast } from '../hooks/useToast';
import { IdeaSummaryHeader } from '../features/prd/components/PrdBuilder/IdeaSummaryHeader';
import { PrdBuilderLayout } from '../features/prd/components/PrdBuilder/PrdBuilderLayout';
import { PrdPreview } from '../features/prd/components/PrdBuilder/PrdPreview';
import { ChatInterface } from '../features/prd/components/PrdBuilder/ChatInterface';
import { PrdBuilderSkeleton } from '../features/prd/components/PrdBuilder/PrdBuilderSkeleton';
import { PrdBuilderError } from '../features/prd/components/PrdBuilder/PrdBuilderError';
import { SaveIndicator, CompletionValidationModal, ConfirmCompletionModal, CompletedPrdHeader } from '../features/prd/components';

export function PrdBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    idea,
    prd,
    isLoading,
    error,
    isIdeaNotFound,
    isIdeaNotApproved,
    isCreatingPrd,
  } = usePrdPageData(id);

  // IMPORTANT: All hooks must be called BEFORE any early returns to maintain consistent hook order
  const { toast } = useToast();

  // Use usePrdBuilder hook for section state management with auto-save
  // Pass fallback values when prd is not yet available
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
    isComplete,
    showValidationModal,
    showConfirmModal,
    attemptMarkComplete,
    confirmComplete,
    closeValidationModal,
    closeConfirmModal,
    isCompletingPrd,
  } = usePrdBuilder({
    prdId: prd?.id ?? '',
    initialContent: prd?.content ?? undefined,
    prdStatus: prd?.status ?? 'draft',
  });

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

  // Handle completion confirmation
  const handleConfirmComplete = async () => {
    const result = await confirmComplete();
    if (result.data) {
      toast({ 
        title: 'Success!',
        description: 'PRD marked complete! Ready for prototype generation.',
        variant: 'success',
      });
    } else if (result.error) {
      toast({
        title: 'Error',
        description: `Failed to complete PRD: ${result.error.message}`,
        variant: 'error',
      });
    }
  };

  return (
    <div className="h-full">
      {/* Show completed header if PRD is complete */}
      {isComplete ? (
        <CompletedPrdHeader
          prdId={prd.id}
          ideaId={idea.id}
          ideaTitle={idea.title || idea.problem.substring(0, 50)}
          completedAt={prd.completed_at!}
          onViewPrd={() => navigate(`/prd/${prd.id}`)}
        />
      ) : (
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
                onClick={attemptMarkComplete}
                disabled={isCompletingPrd}
              >
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PRD Builder content - read-only if complete */}
      <div className={`p-4 ${isComplete ? 'pointer-events-none opacity-75' : ''}`}>
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
        onClose={closeValidationModal}
        validation={completionValidation}
        onFocusSection={(sectionKey) => {
          focusOnSection(sectionKey);
          closeValidationModal();
        }}
      />

      {/* Completion Confirmation Modal */}
      <ConfirmCompletionModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmComplete}
        prdContent={prdContent}
        ideaTitle={idea.title || idea.problem.substring(0, 50)}
        isLoading={isCompletingPrd}
      />
    </div>
  );
}
