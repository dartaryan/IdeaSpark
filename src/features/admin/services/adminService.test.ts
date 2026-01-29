// src/features/admin/services/adminService.test.ts
// Story 5.7 - Task 6: Tests for user list and activity functions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminService } from './adminService';
import { supabase } from '../../../lib/supabase';

// Mock supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('adminService - User Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch all users with ideas count', async () => {
      // RED: Test first - will fail because function doesn't exist yet
      const mockUsers = [
        {
          id: 'user-1',
          email: 'john@example.com',
          role: 'user',
          created_at: '2024-01-01T00:00:00Z',
          ideas: [{ created_at: '2024-03-01' }, { created_at: '2024-02-01' }],
        },
        {
          id: 'user-2',
          email: 'jane@example.com',
          role: 'admin',
          created_at: '2024-02-01T00:00:00Z',
          ideas: [{ created_at: '2024-03-15' }],
        },
      ];

      // First call for checking admin role
      const roleCheckQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      };

      // Second call for fetching all users
      const usersQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      vi.mocked(supabase.from)
        .mockReturnValueOnce(roleCheckQuery as any) // First call for role check
        .mockReturnValueOnce(usersQuery as any); // Second call for users

      const result = await adminService.getAllUsers();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data![0].id).toBe('user-1');
      expect(result.data![0].ideas_count).toBe(2);
      expect(result.data![1].ideas_count).toBe(1);
    });

    it('should return error if not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await adminService.getAllUsers();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Not authenticated');
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });

    it('should return error if not admin', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { role: 'user' },
          error: null,
        }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await adminService.getAllUsers();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Unauthorized access');
    });

    it('should handle database errors gracefully', async () => {
      const roleCheckQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      };

      const usersQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      vi.mocked(supabase.from)
        .mockReturnValueOnce(roleCheckQuery as any)
        .mockReturnValueOnce(usersQuery as any);

      const result = await adminService.getAllUsers();

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Failed to load users');
    });
  });

  describe('getUserById', () => {
    it('should fetch user details with activity metrics', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'john@example.com',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
        ideas: [
          { id: '1', title: 'Idea 1', status: 'submitted', created_at: '2024-03-01' },
          { id: '2', title: 'Idea 2', status: 'approved', created_at: '2024-02-01' },
          { id: '3', title: 'Idea 3', status: 'approved', created_at: '2024-01-15' },
        ],
      };

      const roleCheckQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      };

      const userQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      vi.mocked(supabase.from)
        .mockReturnValueOnce(roleCheckQuery as any)
        .mockReturnValueOnce(userQuery as any);

      const result = await adminService.getUserById('user-1');

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe('user-1');
      expect(result.data!.ideas_count).toBe(3);
      expect(result.data!.ideas_by_status.submitted).toBe(1);
      expect(result.data!.ideas_by_status.approved).toBe(2);
    });

    it('should return error if user not found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1', user_metadata: { role: 'admin' } } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await adminService.getUserById('nonexistent');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('getIdeasByUser', () => {
    it('should fetch all ideas submitted by specific user', async () => {
      const mockIdeas = [
        {
          id: 'idea-1',
          user_id: 'user-1',
          title: 'Test Idea 1',
          status: 'submitted',
          created_at: '2024-03-01',
        },
        {
          id: 'idea-2',
          user_id: 'user-1',
          title: 'Test Idea 2',
          status: 'approved',
          created_at: '2024-02-01',
        },
      ];

      const roleCheckQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      };

      const ideasQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockIdeas, error: null }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      vi.mocked(supabase.from)
        .mockReturnValueOnce(roleCheckQuery as any)
        .mockReturnValueOnce(ideasQuery as any);

      const result = await adminService.getIdeasByUser('user-1');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data![0].id).toBe('idea-1');
      expect(result.data![1].id).toBe('idea-2');
    });

    it('should return empty array if user has no ideas', async () => {
      const roleCheckQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
      };

      const ideasQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      vi.mocked(supabase.from)
        .mockReturnValueOnce(roleCheckQuery as any)
        .mockReturnValueOnce(ideasQuery as any);

      const result = await adminService.getIdeasByUser('user-with-no-ideas');

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it('should return error if not admin', async () => {
      const roleCheckQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { role: 'user' },
          error: null,
        }),
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      } as any);

      vi.mocked(supabase.from).mockReturnValue(roleCheckQuery as any);

      const result = await adminService.getIdeasByUser('some-user');

      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });
  });
});
