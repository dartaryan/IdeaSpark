import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../../routes/routeConstants';
import { prdService } from '../../prd/services/prdService';
import { prdQueryKeys } from '../../prd/hooks/queryKeys';
import type { Idea } from '../types';

interface IdeaDetailActionsProps {
  idea: Idea;
}

/**
 * Action buttons for idea detail page
 * - "Build PRD" button when status is approved (AC 6, 7)
 * - "View PRD" button when PRD is complete (Story 3.9, AC 3)
 * - "Continue Building PRD" when PRD is draft (Story 3.9, AC 3)
 * - "Back to My Ideas" button (AC 10)
 */
export function IdeaDetailActions({ idea }: IdeaDetailActionsProps) {
  const navigate = useNavigate();
  
  // Fetch PRD for this idea to determine what actions to show
  const { data: prd } = useQuery({
    queryKey: prdQueryKeys.byIdea(idea.id),
    queryFn: async () => {
      const result = await prdService.getPrdByIdeaId(idea.id);
      if (result.error) return null;
      return result.data;
    },
    enabled: idea.status === 'approved' || idea.status === 'prd_development' || idea.status === 'prototype_complete',
  });

  const canBuildPrd = idea.status === 'approved' && !prd;
  const hasDraftPrd = prd?.status === 'draft';
  const hasCompletePrd = prd?.status === 'complete';

  const handleBuildPrd = () => {
    // Navigate to PRD builder with idea ID (AC 7)
    navigate(ROUTES.PRD_BUILDER.replace(':id', idea.id));
  };

  const handleViewPrd = () => {
    // Navigate to PRD view page (Story 3.9, AC 3)
    if (prd) {
      navigate(`/prd/${prd.id}`);
    }
  };

  const handleBackToList = () => {
    // Navigate back to My Ideas list (AC 10)
    navigate(ROUTES.IDEAS);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Build PRD - only show when approved and no PRD exists */}
      {canBuildPrd && (
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleBuildPrd}
          data-testid="build-prd-button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          Build PRD
        </button>
      )}

      {/* Continue Building PRD - show when PRD is draft */}
      {hasDraftPrd && (
        <button
          className="btn btn-warning btn-lg w-full"
          onClick={handleBuildPrd}
          data-testid="continue-prd-button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
            />
          </svg>
          Continue Building PRD
        </button>
      )}

      {/* View PRD - show when PRD is complete */}
      {hasCompletePrd && (
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleViewPrd}
          data-testid="view-prd-button"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          View PRD
        </button>
      )}
      
      <button
        className="btn btn-ghost"
        onClick={handleBackToList}
        data-testid="back-to-ideas-button"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Back to My Ideas
      </button>
    </div>
  );
}
