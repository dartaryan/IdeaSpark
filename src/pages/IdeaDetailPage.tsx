import { useParams } from 'react-router-dom';
import { useIdea } from '../features/ideas/hooks/useIdea';
import { IdeaDetailContent } from '../features/ideas/components/IdeaDetailContent';
import { IdeaStatusInfo } from '../features/ideas/components/IdeaStatusInfo';
import { IdeaDetailActions } from '../features/ideas/components/IdeaDetailActions';
import { IdeaDetailSkeleton } from '../features/ideas/components/IdeaDetailSkeleton';
import { IdeaNotFound } from '../features/ideas/components/IdeaNotFound';

/**
 * Idea detail page showing full idea information
 * Implements AC 1-10
 * 
 * URL: /ideas/:id
 * 
 * States:
 * - Loading: Shows skeleton (AC 8)
 * - Not Found: Shows not found message (AC 9)
 * - Error: Shows error alert (AC 9)
 * - Success: Shows idea content with status and actions (AC 1-7, 10)
 */
export function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { idea, isLoading, error, isNotFound } = useIdea(id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <IdeaDetailSkeleton />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="max-w-4xl mx-auto">
        <IdeaNotFound />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error.message || 'Failed to load idea'}</span>
        </div>
      </div>
    );
  }

  if (!idea) return null;

  // Use title or truncated problem statement as display title
  const displayTitle = idea.title || idea.problem.substring(0, 50) + (idea.problem.length > 50 ? '...' : '');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6">{displayTitle}</h1>
      
      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width on desktop */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <IdeaDetailContent idea={idea} />
        </div>
        
        {/* Sidebar - 1/3 width on desktop */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-4">
          <IdeaStatusInfo idea={idea} />
          <IdeaDetailActions idea={idea} />
        </div>
      </div>
    </div>
  );
}
