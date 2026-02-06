import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../../routes/routeConstants';
import { prdService } from '../../prd/services/prdService';
import { prdQueryKeys } from '../../prd/hooks/queryKeys';
import { usePrototypeByIdeaId } from '../../prototypes/hooks/usePrototypeByIdeaId';
import type { Idea } from '../types';

interface IdeaDetailActionsProps {
  idea: Idea;
}

/**
 * Action buttons for idea detail page (Task 9 - Story 4.8)
 * - "Build PRD" button when status is approved (AC 6, 7)
 * - "View PRD" button when PRD is complete (Story 3.9, AC 3)
 * - "Continue Building PRD" when PRD is draft (Story 3.9, AC 3)
 * - "Generate Prototype" button when PRD is complete and no prototype exists (AC 3, Task 3)
 * - "View Prototype" button when prototype exists (AC 2, Task 2)
 * - "Back to My Ideas" button (AC 10)
 */
export function IdeaDetailActions({ idea }: IdeaDetailActionsProps) {
  const navigate = useNavigate();
  
  // Fetch PRD for this idea to determine what actions to show
  const { data: prd, isLoading: prdLoading } = useQuery({
    queryKey: prdQueryKeys.byIdea(idea.id),
    queryFn: async () => {
      const result = await prdService.getPrdByIdeaId(idea.id);
      if (result.error) return null;
      return result.data;
    },
    enabled: idea.status === 'approved' || idea.status === 'prd_development' || idea.status === 'prototype_complete',
  });

  // Fetch prototype for this idea (Task 2, Task 9)
  const { data: prototype, isLoading: prototypeLoading } = usePrototypeByIdeaId(idea.id);

  const isLoading = prdLoading || prototypeLoading;

  const canBuildPrd = idea.status === 'approved' && !prd;
  const hasDraftPrd = prd?.status === 'draft';
  const hasCompletePrd = prd?.status === 'complete';
  const hasPrototype = !!prototype;

  const handleBuildPrd = () => {
    // Navigate to PRD builder with idea ID (AC 7)
    navigate(ROUTES.PRD_BUILDER.replace(':id', idea.id));
  };

  const handleViewPrd = () => {
    // Navigate to PRD view page (Story 3.9, AC 3)
    if (prd) {
      navigate(ROUTES.PRD_VIEW.replace(':prdId', prd.id));
    }
  };

  const handleBackToList = () => {
    // Navigate back to My Ideas list (AC 10)
    navigate(ROUTES.IDEAS);
  };

  const handleViewPrototype = () => {
    // Navigate to prototype viewer (AC 2, Task 2)
    if (prototype) {
      navigate(`/prototypes/${prototype.id}`);
    }
  };

  const handleGeneratePrototype = () => {
    // Navigate to PRD view page which has the generate prototype button (AC 3, Task 3)
    if (prd) {
      navigate(ROUTES.PRD_VIEW.replace(':prdId', prd.id));
    }
  };

  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="skeleton h-14 w-full"></div>
        <div className="skeleton h-10 w-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* View Prototype - show when prototype exists (AC 2, Task 2) */}
      {hasPrototype && (
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleViewPrototype}
          data-testid="view-prototype-button"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
            />
          </svg>
          View Prototype
          {prototype && (
            <span className="badge badge-secondary ml-2">v{prototype.version}</span>
          )}
        </button>
      )}

      {/* Generate Prototype - show when PRD complete and no prototype (AC 3, Task 3) */}
      {hasCompletePrd && !hasPrototype && (
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleGeneratePrototype}
          data-testid="generate-prototype-button"
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
              d="M13 10V3L4 14h7v7l9-11h-7z" 
            />
          </svg>
          Generate Prototype
        </button>
      )}

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
          className="btn btn-ghost btn-lg w-full"
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
