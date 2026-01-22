import { useParams } from 'react-router-dom';
import { usePrdBuilder } from '../features/prd/hooks/usePrdBuilder';
import { IdeaSummaryHeader } from '../features/prd/components/PrdBuilder/IdeaSummaryHeader';
import { PrdBuilderLayout } from '../features/prd/components/PrdBuilder/PrdBuilderLayout';
import { PrdPreviewPanel } from '../features/prd/components/PrdBuilder/PrdPreviewPanel';
import { ChatInterface } from '../features/prd/components/PrdBuilder/ChatInterface';
import { PrdBuilderSkeleton } from '../features/prd/components/PrdBuilder/PrdBuilderSkeleton';
import { PrdBuilderError } from '../features/prd/components/PrdBuilder/PrdBuilderError';
import type { PrdContent } from '../features/prd/types';

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

  // Prepare PRD content for ChatInterface
  const prdContent: PrdContent = {
    problemStatement: prd.problem_statement || undefined,
    goalsAndMetrics: prd.goals_and_metrics || undefined,
    userStories: prd.user_stories || undefined,
    requirements: prd.requirements || undefined,
    technicalConsiderations: prd.technical_considerations || undefined,
    risks: prd.risks || undefined,
    timeline: prd.timeline || undefined,
  };

  // Handler for section updates (Story 3.5 will implement full functionality)
  const handleSectionUpdates = () => {
    // TODO: Story 3.5 will implement real-time PRD section updates
    // For now, this is a placeholder to satisfy the interface
  };

  return (
    <div className="h-full">
      <IdeaSummaryHeader idea={idea} />
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
          previewPanel={<PrdPreviewPanel prd={prd} />}
        />
      </div>
    </div>
  );
}
