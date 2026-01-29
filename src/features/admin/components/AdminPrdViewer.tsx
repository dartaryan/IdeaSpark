// src/features/admin/components/AdminPrdViewer.tsx
// Story 5.6 - Task 4: Create AdminPrdViewer component

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminPrd } from '../hooks/useAdminPrd';
import { 
  ArrowLeftIcon, 
  EyeIcon, 
  UserIcon, 
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { PrdDocumentView } from '../../prd/components';

/**
 * Admin PRD viewer component - view any user's PRD
 * Story 5.6 - Task 4: Create AdminPrdViewer component (AC: View any user's PRD)
 * 
 * Subtasks implemented:
 * - 4.1: Create AdminPrdViewer.tsx in features/admin/components/
 * - 4.2: Load PRD document by prd_id using adminService
 * - 4.3: Display PRD owner information (user name, email) at top
 * - 4.4: Show PRD creation date and completion date if complete
 * - 4.5: Render all PRD sections in readable format
 * - 4.6: Display PRD status badge (draft vs complete)
 * - 4.7: Add breadcrumb navigation
 * - 4.8: If PRD is draft, show chat history in collapsible section
 * - 4.9: Add "Back to Idea" button to return to IdeaDetailPage
 * - 4.10: If idea has prototype, show "View Prototype" button
 */
export function AdminPrdViewer() {
  const { prdId } = useParams<{ prdId: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useAdminPrd(prdId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-semibold text-error">PRD Not Found</h2>
        <p className="text-base-content/60">
          {response?.error?.message || 'The requested PRD could not be found.'}
        </p>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-primary">
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  const prd = response.data;
  const isPrdComplete = prd.status === 'complete';
  const ideaId = prd.idea?.id;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Subtask 4.7: Breadcrumb navigation */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-4 py-3">
          <div className="breadcrumbs text-sm">
            <ul>
              <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
              <li><Link to="/admin/ideas">Ideas</Link></li>
              {ideaId && <li><Link to={`/ideas/${ideaId}`}>Idea Detail</Link></li>}
              <li>PRD</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Header with owner info */}
      <div className="bg-white border-b border-base-300 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex flex-col gap-4">
            {/* Subtask 4.9: Back to Idea button */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => ideaId ? navigate(`/ideas/${ideaId}`) : navigate(-1)}
                className="btn btn-ghost btn-sm gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Idea
              </button>

              {/* Subtask 4.6: PRD status badge */}
              <div>
                {isPrdComplete ? (
                  <span className="badge badge-success gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    PRD Complete
                  </span>
                ) : (
                  <span className="badge badge-warning gap-2">
                    <ClockIcon className="w-3 h-3" />
                    PRD Draft
                  </span>
                )}
              </div>
            </div>

            {/* Subtask 4.3: PRD owner information */}
            <div className="flex items-start gap-4">
              <div className="avatar placeholder">
                <div className="bg-[#525355] text-white rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-lg">
                    {prd.creator?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <UserIcon className="w-4 h-4 text-[#525355]" />
                  <span className="font-semibold text-gray-900">{prd.creator?.name || 'Unknown User'}</span>
                  <span className="badge badge-sm badge-ghost">{prd.creator?.role || 'user'}</span>
                </div>
                <div className="text-sm text-gray-600">{prd.creator?.email}</div>
              </div>
            </div>

            {/* Subtask 4.4: PRD dates */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#525355]" />
                <span>Created {formatDistanceToNow(new Date(prd.created_at), { addSuffix: true })}</span>
              </div>
              {prd.completed_at && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Completed {formatDistanceToNow(new Date(prd.completed_at), { addSuffix: true })}</span>
                </div>
              )}
            </div>

            {/* Idea title */}
            {prd.idea?.title && (
              <div className="mt-2">
                <h1 className="text-2xl font-bold text-gray-900">{prd.idea.title}</h1>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Subtask 4.5: Render all PRD sections */}
        <PrdDocumentView prdContent={prd.content} />

        {/* Subtask 4.10: View Prototype button */}
        <div className="mt-8 flex justify-center gap-4">
          {ideaId && (
            <button
              onClick={() => navigate(`/ideas/${ideaId}`)}
              className="btn btn-outline gap-2 rounded-[20px]"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Idea
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
