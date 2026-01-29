import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useIdea } from '../features/ideas/hooks/useIdea';
import { useAdminIdea } from '../features/admin/hooks/useAdminIdea';
import { IdeaDetailContent } from '../features/ideas/components/IdeaDetailContent';
import { IdeaStatusInfo } from '../features/ideas/components/IdeaStatusInfo';
import { IdeaDetailActions } from '../features/ideas/components/IdeaDetailActions';
import { IdeaDetailSkeleton } from '../features/ideas/components/IdeaDetailSkeleton';
import { IdeaNotFound } from '../features/ideas/components/IdeaNotFound';
import { ApproveIdeaButton } from '../features/admin/components/ApproveIdeaButton';
import { RejectIdeaButton } from '../features/admin/components/RejectIdeaButton';
import { UserProfileCard } from '../features/admin/components/UserProfileCard';
import { SubmissionTimeline } from '../features/admin/components/SubmissionTimeline';
import { useAuth } from '../features/auth/hooks/useAuth';
import { 
  ExclamationTriangleIcon, 
  EyeIcon, 
  DocumentTextIcon,
  ComputerDesktopIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Story 5.6 - Task 1: Check if user is admin (Subtask 1.1)
  const isAdmin = user?.role === 'admin';
  
  // Use appropriate hook based on role - admins get more data
  const regularQuery = useIdea(id);
  const adminQuery = useAdminIdea(id || '');
  
  // Select appropriate query result
  const { idea, isLoading, error, isNotFound } = isAdmin 
    ? {
        idea: adminQuery.data?.data,
        isLoading: adminQuery.isLoading,
        error: adminQuery.error,
        isNotFound: !adminQuery.isLoading && !!adminQuery.error
      }
    : regularQuery;

  // Task 4: Check if user is admin and idea is submitted
  const canApprove = isAdmin && idea?.status === 'submitted';
  
  // Story 5.5 Task 5: Check if admin can reject
  const canReject = isAdmin && idea?.status === 'submitted';
  
  // Story 5.5 Task 8: Check if idea is rejected and has feedback
  const isRejected = idea?.status === 'rejected';
  // Access rejection fields from database (will be available after migration)
  const rejectionFeedback = (idea as any)?.rejection_feedback;
  const rejectedAt = (idea as any)?.rejected_at;
  
  // Story 5.6 - Task 2 & 3: Admin-specific data (Subtasks 2.1, 3.1)
  const hasPrd = isAdmin && idea?.prd_id;
  const prdStatus = isAdmin ? idea?.prd_status : null;
  const hasPrototype = isAdmin && idea?.prototype_id;
  const prototypeStatus = isAdmin ? idea?.prototype_status : null;

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
          {/* Story 5.6 - Task 1: Subtask 1.2 - Display submitter info for admins */}
          {isAdmin && idea?.submitter && (
            <UserProfileCard
              user={{
                id: idea.submitter.id,
                name: idea.submitter.name,
                email: idea.submitter.email,
                role: idea.submitter.role,
              }}
              joinDate={idea.created_at}
              onViewAllIdeas={() => navigate(`/admin/ideas?user=${idea.submitter.id}`)}
            />
          )}
          
          {/* Story 5.6 - Task 7: Submission timeline for admins */}
          {isAdmin && (
            <SubmissionTimeline
              ideaStatus={idea?.status || 'submitted'}
              submittedAt={idea?.created_at || ''}
              statusUpdatedAt={idea?.status_updated_at}
              prdCreatedAt={idea?.prd_created_at}
              prdCompletedAt={idea?.prd_completed_at}
              prototypeCreatedAt={idea?.prototype_created_at}
              rejectedAt={rejectedAt}
              rejectedBy={idea?.rejected_by}
            />
          )}
          
          <IdeaStatusInfo idea={idea} />
          
          {/* Story 5.5 Task 8: Display rejection feedback for rejected ideas */}
          {isRejected && rejectionFeedback && (
            <div className="card bg-red-50 border border-red-200 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-[#EF4444]" />
                  <h3 className="font-semibold text-sm text-red-700">Idea Rejected</h3>
                </div>
                
                {/* Rejection timestamp - Task 9 */}
                {rejectedAt && (
                  <p className="text-xs text-red-500 mb-2">
                    Rejected {formatDistanceToNow(new Date(rejectedAt), { addSuffix: true })}
                  </p>
                )}
                
                {/* Rejection feedback display - Task 8 Subtasks 8.2-8.4 */}
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{rejectionFeedback}</p>
                </div>
                
                {/* Task 8 Subtask 8.5: Tips for future submissions */}
                <div className="mt-3 pt-3 border-t border-red-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Tips for future submissions:</p>
                  <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                    <li>Clearly define the problem you're solving</li>
                    <li>Explain how your solution addresses the problem</li>
                    <li>Describe the potential impact on the organization</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Story 5.6 - Tasks 2 & 3: Admin navigation to PRD and Prototype */}
          {isAdmin && (hasPrd || hasPrototype) && (
            <div className="card bg-base-100 border border-base-200 shadow-sm rounded-[20px]">
              <div className="card-body p-4">
                <h3 className="font-semibold text-sm mb-3 text-gray-700">View Artifacts</h3>
                <div className="flex flex-col gap-2">
                  {/* Task 2: Subtasks 2.2-2.7 - PRD navigation button */}
                  {hasPrd && (
                    <button
                      onClick={() => navigate(`/admin/prds/${idea.prd_id}`)}
                      className="btn btn-sm btn-primary gap-2 normal-case rounded-[20px]"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      View PRD
                      {prdStatus === 'draft' && (
                        <span className="badge badge-warning badge-sm">In Progress</span>
                      )}
                      {prdStatus === 'complete' && (
                        <span className="badge badge-success badge-sm">Complete</span>
                      )}
                    </button>
                  )}
                  {!hasPrd && (
                    <button
                      disabled
                      className="btn btn-sm btn-disabled gap-2 normal-case rounded-[20px]"
                      title="No PRD yet"
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      View PRD
                      <span className="badge badge-ghost badge-sm">No PRD yet</span>
                    </button>
                  )}

                  {/* Task 3: Subtasks 3.2-3.7 - Prototype navigation button */}
                  {hasPrototype && (
                    <button
                      onClick={() => navigate(`/admin/prototypes/${idea.prototype_id}`)}
                      className="btn btn-sm btn-primary gap-2 normal-case rounded-[20px]"
                    >
                      <ComputerDesktopIcon className="w-4 h-4" />
                      View Prototype
                      {prototypeStatus === 'generating' && (
                        <span className="badge badge-warning badge-sm gap-1">
                          <ClockIcon className="w-3 h-3" />
                          Generating...
                        </span>
                      )}
                      {prototypeStatus === 'ready' && (
                        <span className="badge badge-success badge-sm">Ready</span>
                      )}
                    </button>
                  )}
                  {!hasPrototype && (
                    <button
                      disabled
                      className="btn btn-sm btn-disabled gap-2 normal-case rounded-[20px]"
                      title="No prototype yet"
                    >
                      <ComputerDesktopIcon className="w-4 h-4" />
                      View Prototype
                      <span className="badge badge-ghost badge-sm">No prototype yet</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Task 4 & Story 5.5 Task 5: Admin action buttons - prominently positioned */}
          {(canApprove || canReject) && (
            <div className="card bg-blue-50 border border-blue-200 shadow-sm rounded-[20px]">
              <div className="card-body p-4">
                <h3 className="font-semibold text-sm mb-3 text-gray-700">Admin Actions</h3>
                <div className="flex flex-col gap-2">
                  {canApprove && (
                    <ApproveIdeaButton 
                      idea={{
                        id: idea.id,
                        user_id: idea.user_id,
                        title: idea.title || idea.problem.substring(0, 50),
                        problem: idea.problem,
                        solution: idea.solution,
                        impact: idea.impact,
                        submitter_name: idea?.submitter?.name || 'Submitter',
                        submitter_email: idea?.submitter?.email || '',
                        status: idea.status,
                        created_at: idea.created_at,
                        updated_at: idea.updated_at,
                        status_updated_at: idea.status_updated_at || null,
                      }} 
                    />
                  )}
                  {/* Story 5.5 Task 5: Add RejectIdeaButton */}
                  {canReject && (
                    <RejectIdeaButton 
                      idea={{
                        id: idea.id,
                        user_id: idea.user_id,
                        title: idea.title || idea.problem.substring(0, 50),
                        problem: idea.problem,
                        solution: idea.solution,
                        impact: idea.impact,
                        submitter_name: idea?.submitter?.name || 'Submitter',
                        submitter_email: idea?.submitter?.email || '',
                        status: idea.status,
                        created_at: idea.created_at,
                        updated_at: idea.updated_at,
                        status_updated_at: idea.status_updated_at || null,
                      }}
                      variant="button"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
          
          <IdeaDetailActions idea={idea} />
        </div>
      </div>
    </div>
  );
}
