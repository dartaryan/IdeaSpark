// src/features/admin/components/UserList.test.tsx
// Story 5.7 - Task 1: Tests for UserList component

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserList } from './UserList';
import { useUsers } from '../hooks/useUsers';
import { MemoryRouter } from 'react-router-dom';

// Mock the useUsers hook
vi.mock('../hooks/useUsers', () => ({
  useUsers: vi.fn(),
}));

describe('UserList', () => {
  const mockUsers = [
    {
      id: 'user-1',
      name: 'john',
      email: 'john@example.com',
      role: 'user' as const,
      created_at: '2024-01-01T00:00:00Z',
      ideas_count: 5,
      last_idea_submitted_at: '2024-03-01T00:00:00Z',
    },
    {
      id: 'admin-1',
      name: 'admin',
      email: 'admin@example.com',
      role: 'admin' as const,
      created_at: '2024-02-01T00:00:00Z',
      ideas_count: 10,
      last_idea_submitted_at: '2024-03-15T00:00:00Z',
    },
  ];

  it('should display loading skeleton while fetching users', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    // Check for loading skeleton
    expect(screen.getByTestId('user-list-skeleton')).toBeInTheDocument();
  });

  it('should display users in table when loaded', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Join Date')).toBeInTheDocument();
    expect(screen.getByText('Ideas')).toBeInTheDocument();

    // Check user data
    expect(screen.getByText('john')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('5 ideas')).toBeInTheDocument();
    expect(screen.getByText('10 ideas')).toBeInTheDocument();
  });

  it('should display role badges with correct styling', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    // Check for Admin badge
    const adminBadge = screen.getByText('Admin');
    expect(adminBadge).toBeInTheDocument();
    expect(adminBadge).toHaveClass('badge-error'); // PassportCard red for admin

    // Check for User badge
    const userBadge = screen.getByText('User');
    expect(userBadge).toBeInTheDocument();
    expect(userBadge).toHaveClass('badge-ghost'); // Gray for regular user
  });

  it('should display empty state when no users exist', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('should display error state when fetch fails', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load users'),
    } as any);

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
  });

  it('should show user count', () => {
    vi.mocked(useUsers).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <MemoryRouter>
        <UserList />
      </MemoryRouter>
    );

    expect(screen.getByText('Showing 2 users')).toBeInTheDocument();
  });
});
