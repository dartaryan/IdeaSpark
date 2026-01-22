import { useParams } from 'react-router-dom';
import { usePrdBuilder } from '../features/prd/hooks/usePrdBuilder';
import { IdeaSummaryHeader } from '../features/prd/components/PrdBuilder/IdeaSummaryHeader';
import { PrdBuilderLayout } from '../features/prd/components/PrdBuilder/PrdBuilderLayout';
import { PrdPreviewPanel } from '../features/prd/components/PrdBuilder/PrdPreviewPanel';
import { ChatPanelPlaceholder } from '../features/prd/components/PrdBuilder/ChatPanelPlaceholder';
import { PrdBuilderSkeleton } from '../features/prd/components/PrdBuilder/PrdBuilderSkeleton';
import { PrdBuilderError } from '../features/prd/components/PrdBuilder/PrdBuilderError';

export function PrdBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const {
    idea,
    prd,
    isLoading,
    error,
    isIdeaNotFound,
    isIdeaNotApproved,
    isCreatingPrd,
  } = usePrdBuilder(id);

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
  if (!idea) return null;

  return (
    <div className="h-full">
      <IdeaSummaryHeader idea={idea} />
      <div className="p-4">
        <PrdBuilderLayout
          chatPanel={<ChatPanelPlaceholder />}
          previewPanel={<PrdPreviewPanel prd={prd} />}
        />
      </div>
    </div>
  );
}
