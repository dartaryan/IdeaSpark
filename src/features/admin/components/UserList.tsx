// src/features/admin/components/UserList.tsx
// Story 5.7 - Tasks 1, 2, 3, 4: Main user list component with filters and search

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../hooks/useUsers';
import { formatDistanceToNow } from 'date-fns';
import { UserIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * UserList component displays all registered users with their activity
 * Story 5.7 - Tasks 1, 2, 3, 4
 * 
 * Task 1: Basic user list with table display
 * Task 2: Role filter functionality
 * Task 3: Search functionality
 * Task 4: User avatar and details display
 */
export function UserList() {
  const navigate = useNavigate();
  const { data: users, isLoading, isError, error } = useUsers();
  
  // Task 2: Role filter state (Subtask 2.6)
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  
  // Task 3: Search state (Subtask 3.2)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Task 4: Sort state (Subtask 4.8)
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'ideas'>('ideas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Task 2 & 3: Filter and search users (Subtask 2.2, 3.2)
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    let filtered = users;
    
    // Task 2: Apply role filter (Subtask 2.2)
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Task 3: Apply search filter (Subtask 3.2 - case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    // Task 4: Apply sorting (Subtask 4.7, 4.8)
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'ideas') {
        comparison = a.ideas_count - b.ideas_count;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [users, roleFilter, searchQuery, sortBy, sortOrder]);
  
  // Task 3: Clear search (Subtask 3.4)
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Subtask 1.4: Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="user-list-skeleton">
        <div className="skeleton h-8 w-48"></div>
        <div className="skeleton h-64 w-full rounded-[20px]"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="alert alert-error rounded-[20px]">
        <span>Failed to load users. {error?.message}</span>
      </div>
    );
  }

  // Subtask 1.5: Empty state
  if (!users || users.length === 0) {
    return (
      <div className="card bg-base-100 shadow-sm border border-base-200 rounded-[20px]">
        <div className="card-body items-center text-center p-12">
          <UserIcon className="w-16 h-16 text-[#525355] mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No users found</h3>
          <p className="text-sm text-gray-600">
            There are no registered users in the system yet.
          </p>
        </div>
      </div>
    );
  }

  // Helper function to generate initials
  const getInitials = (name: string, email: string) => {
    if (name && name !== email.split('@')[0]) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  // Subtask 1.6: Handle row click
  const handleUserClick = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <div className="space-y-4">
      {/* Task 2 & 3: Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Task 3: Search input (Subtask 3.1, 3.2) */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-[#525355] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10 pr-10 rounded-[20px]"
          />
          {/* Task 3: Clear search button (Subtask 3.4) */}
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Task 2: Role filter dropdown (Subtask 2.1, 2.5) */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-[#525355]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
            className="select select-bordered rounded-[20px] min-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        
        {/* Task 4: Sort dropdown (Subtask 4.8) */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-');
            setSortBy(sort as 'name' | 'date' | 'ideas');
            setSortOrder(order as 'asc' | 'desc');
          }}
          className="select select-bordered rounded-[20px] min-w-[180px]"
        >
          <option value="ideas-desc">Most Active</option>
          <option value="ideas-asc">Least Active</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
        </select>
      </div>

      {/* Task 2 & 3: User count with filter info (Subtask 2.3, 3.6) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {searchQuery || roleFilter !== 'all' ? (
            // Subtask 3.6: Show filtered count
            <>
              Showing {filteredUsers.length} of {users!.length} {users!.length === 1 ? 'user' : 'users'}
              {searchQuery && ` matching "${searchQuery}"`}
              {roleFilter !== 'all' && ` (${roleFilter}s only)`}
            </>
          ) : (
            // Subtask 2.3: Show total count
            <>Showing {users!.length} {users!.length === 1 ? 'user' : 'users'}</>
          )}
        </p>
      </div>
      
      {/* Task 3: No results message (Subtask 3.3) */}
      {filteredUsers.length === 0 && users!.length > 0 && (
        <div className="alert rounded-[20px]">
          <span>No users match your criteria. Try adjusting your filters or search.</span>
        </div>
      )}

      {/* Subtask 1.3 & 1.7: User table with PassportCard styling */}
      {/* Subtask 1.8: Responsive - table scrolls horizontally on mobile */}
      <div className="overflow-x-auto rounded-[20px] border border-base-200 shadow-sm">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Ideas</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="cursor-pointer hover:bg-red-50 transition-colors"
              >
                {/* Avatar and Name */}
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-[#525355] text-white rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {getInitials(user.name, user.email)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </td>

                {/* Role Badge - Subtask 1.7: Admin=red (PassportCard), User=gray */}
                <td>
                  <span
                    className={`badge badge-sm ${
                      user.role === 'admin' ? 'badge-error' : 'badge-ghost'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>

                {/* Join Date */}
                <td>
                  <span className="text-sm text-gray-600">
                    Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </span>
                </td>

                {/* Ideas Count */}
                <td>
                  <span className="text-sm font-medium text-gray-900">
                    {user.ideas_count} {user.ideas_count === 1 ? 'idea' : 'ideas'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
