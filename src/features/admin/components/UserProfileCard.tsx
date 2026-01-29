// src/features/admin/components/UserProfileCard.tsx
// Story 5.6 - Task 10: User profile information display
// Subtask 10.1: Create UserProfileCard component in features/admin/components/

import { UserIcon, EnvelopeIcon, CalendarIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

/**
 * User profile card component for displaying submitter information
 * Story 5.6 - Task 10: Add user profile information display
 * 
 * Subtasks implemented:
 * - 10.2: Display user avatar (initials if no photo) with PassportCard styling
 * - 10.3: Show user full name, email, and role badge
 * - 10.4: Display join date and total ideas submitted count
 * - 10.5: Add link to view all ideas by this user (filter ideas by user_id)
 * - 10.6: Position UserProfileCard in IdeaDetailPage sidebar (desktop) or top (mobile)
 */

interface UserProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
  joinDate?: string;
  totalIdeasCount?: number;
  onViewAllIdeas?: () => void;
}

export function UserProfileCard({ 
  user, 
  joinDate, 
  totalIdeasCount, 
  onViewAllIdeas 
}: UserProfileCardProps) {
  // Subtask 10.2: Generate initials from name or email
  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 rounded-[20px]">
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          {/* Subtask 10.2: User avatar with initials */}
          <div className="avatar placeholder">
            <div className="bg-[#525355] text-white rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-lg font-medium">{initials}</span>
            </div>
          </div>

          {/* Subtask 10.3: User info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 truncate">
              {user.name}
            </h3>
            
            {/* Role badge - Subtask 10.3 */}
            <div className="mt-1">
              <span className={`badge badge-sm ${user.role === 'admin' ? 'badge-error' : 'badge-ghost'}`}>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Email - Subtask 10.3 */}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
          <EnvelopeIcon className="w-4 h-4 text-[#525355]" />
          <span className="truncate">{user.email}</span>
        </div>

        {/* Join date - Subtask 10.4 */}
        {joinDate && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 text-[#525355]" />
            <span>Joined {formatDistanceToNow(new Date(joinDate), { addSuffix: true })}</span>
          </div>
        )}

        {/* Total ideas submitted - Subtask 10.4 */}
        {totalIdeasCount !== undefined && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <LightBulbIcon className="w-4 h-4 text-[#525355]" />
            <span>{totalIdeasCount} {totalIdeasCount === 1 ? 'idea' : 'ideas'} submitted</span>
          </div>
        )}

        {/* Subtask 10.5: Link to view all ideas by this user */}
        {onViewAllIdeas && (
          <div className="mt-3 pt-3 border-t border-base-200">
            <button
              onClick={onViewAllIdeas}
              className="btn btn-sm btn-ghost w-full text-[#E10514] hover:bg-red-50 normal-case"
            >
              <UserIcon className="w-4 h-4" />
              View all ideas from this user
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
