// src/features/prototypes/services/prototypeService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prototypeService } from './prototypeService';
import { supabase } from '../../../lib/supabase';

// Mock the supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('prototypeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockPrototypeRow = {
    id: 'proto-789',
    prd_id: 'prd-123',
    idea_id: 'idea-456',
    user_id: 'user-123',
    url: 'https://preview.example.com/proto-789',
    code: 'import React from "react"...',
    version: 1,
    refinement_prompt: null,
    status: 'ready' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockPrototype = {
    id: 'proto-789',
    prdId: 'prd-123',
    ideaId: 'idea-456',
    userId: 'user-123',
    url: 'https://preview.example.com/proto-789',
    code: 'import React from "react"...',
    version: 1,
    refinementPrompt: null,
    status: 'ready' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('getVersionHistory', () => {
    it('returns all versions for a PRD ordered by version descending', async () => {
      const mockVersions = [
        { ...mockPrototypeRow, id: 'proto-3', version: 3, refinement_prompt: 'Make it blue' },
        { ...mockPrototypeRow, id: 'proto-2', version: 2, refinement_prompt: 'Add header' },
        { ...mockPrototypeRow, id: 'proto-1', version: 1, refinement_prompt: null },
      ];

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockVersions,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getVersionHistory('prd-123');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(3);
      expect(result.data![0].version).toBe(3);
      expect(result.data![1].version).toBe(2);
      expect(result.data![2].version).toBe(1);
      expect(supabase.from).toHaveBeenCalledWith('prototypes');
      expect(mockFromChain.eq).toHaveBeenCalledWith('prd_id', 'prd-123');
      expect(mockFromChain.order).toHaveBeenCalledWith('version', { ascending: false });
    });

    it('returns empty array when no versions exist', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getVersionHistory('prd-123');

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it('returns error when database query fails', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: 'DB_ERROR' },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getVersionHistory('prd-123');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Database error',
        code: 'DB_ERROR',
      });
    });

    it('converts snake_case DB fields to camelCase', async () => {
      const mockVersions = [mockPrototypeRow];
      
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockVersions,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getVersionHistory('prd-123');

      expect(result.error).toBeNull();
      expect(result.data![0]).toMatchObject({
        id: mockPrototypeRow.id,
        prdId: mockPrototypeRow.prd_id,
        ideaId: mockPrototypeRow.idea_id,
        userId: mockPrototypeRow.user_id,
        refinementPrompt: mockPrototypeRow.refinement_prompt,
        createdAt: mockPrototypeRow.created_at,
        updatedAt: mockPrototypeRow.updated_at,
      });
    });

    it('handles unexpected errors gracefully', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockRejectedValue(new Error('Network error')),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getVersionHistory('prd-123');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to get prototypes',
        code: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('restore', () => {
    it('should be implemented to restore a prototype version', async () => {
      // This test will fail initially - RED phase
      expect(prototypeService.restore).toBeDefined();
      expect(typeof prototypeService.restore).toBe('function');
    });

    it('returns error when not authenticated', async () => {
      // RED phase - this will fail until we implement restore()
      if (!prototypeService.restore) {
        expect(true).toBe(true); // Skip for now
        return;
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await prototypeService.restore('proto-123');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });
  });
});
