// src/features/admin/components/UserDetailView.tsx
// Story 5.7 - Task 5: User detail view with activity and ideas

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useUserIdeas } from '../hooks/useUserIdeas';
import { UserProfileCard } from './UserProfileCard';
import { IdeaCard } from '../../ideas/components/IdeaCard';
import { ArrowLeftIcon, HomeIcon, UsersIcon, LightBulbIcon } from '@heroicons/react/24/outline';

/**
 * UserDetailView component displays detailed user information and their ideas
 * Story 5.7 - Task 5: Create UserDetailView component
 * 
 * Subtasks implemented:
 * - 5.1: Create UserDetailView.tsx in features/admin/components/
 * - 5.2: Load user details by user_id using adminService.getUserById() (via useUser hook)
 * - 5.3: Display UserProfileCard at top with user info
 * - 5.4: Load all ideas submitted by this user using adminService.getIdeasByUser() (via useUserIdeas hook)
 * - 5.5: Display ideas in list format (reuse IdeaCard component from features/ideas/)
 * - 5.6: Each idea card shows: title, status, submission date, preview of problem
 * - 5.7: Click on idea card navigates to IdeaDetailPage (admin view)
 * - 5.8: Add breadcrumb navigation
 * - 5.9: Add "Back to Users" button to return to UserList
 * - 5.10: Show empty state if user has no ideas
 */
export function UserDetailView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const { data: user, isLoading: userLoading, isError: userError } = useUser(userId!);
  const { data: ideas, isLoading: ideasLoading, isError: ideasError } = useUserIdeas(userId!);

  // Loading state
  if (userLoading || ideasLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64"></div>
        <div className="skeleton h-48 w-full rounded-[20px]"></div>
        <div className="skeleton h-64 w-full rounded-[20px]"></div>
      </div>
    );
  }

  // Error state
  if (userError || !user) {
    return (
      <div className="space-y-4">
        {/* Subtask 5.9: Back button */}
        <button
          onClick={() => navigate('/admin/users')}
          className="btn btn-ghost gap-2 rounded-[20px]"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Users
        </button>
        
        <div className="alert alert-error rounded-[20px]">
          <span>User not found or failed to load user details.</span>
        </div>
      </div>
    );
  }

  // Ideas error state (still show user info)
  const showIdeasError = ideasError && !ideas;

  return (
    <div className="space-y-6">
      {/* Subtask 5.8: Breadcrumb navigation */}
      <div className="text-sm breadcrumbs">
        <ul>
          <li>
            <Link to="/admin" className="flex items-center gap-1 hover:text-[#E10514]">
              <HomeIcon className="w-4 h-4" />
              Admin Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/users" className="flex items-center gap-1 hover:text-[#E10514]">
              <UsersIcon className="w-4 h-4" />
              Users
            </Link>
          </li>
          <li className="text-gray-900 font-medium">{user.name}</li>
        </ul>
      </div>

      {/* Subtask 5.9: Back to Users button */}
      <button
        onClick={() => navigate('/admin/users')}
        className="btn btn-ghost gap-2 rounded-[20px]"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back to Users
      </button>

      {/* Subtask 5.3: Display UserProfileCard */}
      <UserProfileCard
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        joinDate={user.created_at}
        totalIdeasCount={user.ideas_count}
      />

      {/* User Ideas Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Submitted Ideas</h2>
          <div className="flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-[#525355]" />
            <span className="text-sm font-medium text-gray-600">
              {ideas?.length || 0} {ideas?.length === 1 ? 'idea' : 'ideas'}
            </span>
          </div>
        </div>

        {/* Subtask 5.10: Empty state if user has no ideas */}
        {!showIdeasError && (!ideas || ideas.length === 0) && (
          <div className="card bg-base-100 shadow-sm border border-base-200 rounded-[20px]">
            <div className="card-body items-center text-center p-12">
              <LightBulbIcon className="w-16 h-16 text-[#525355] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No ideas submitted yet</h3>
              <p className="text-sm text-gray-600">
                This user hasn't submitted any ideas to the innovation platform.
              </p>
            </div>
          </div>
        )}

        {/* Error state for ideas */}
        {showIdeasError && (
          <div className="alert alert-error rounded-[20px]">
            <span>Failed to load user's ideas. Please try again later.</span>
          </div>
        )}

        {/* Subtask 5.5, 5.6, 5.7: Display ideas using IdeaCard */}
        {ideas && ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
