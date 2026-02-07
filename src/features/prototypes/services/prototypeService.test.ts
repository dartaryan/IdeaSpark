// src/features/prototypes/services/prototypeService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prototypeService } from './prototypeService';
import { supabase } from '../../../lib/supabase';
import { createEmptyPrototypeState } from '../types/prototypeState';
import type { PrototypeState } from '../types/prototypeState';

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
    share_id: 'share-uuid-123',
    is_public: false,
    shared_at: null,
    view_count: 0,
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

  describe('generateShareLink', () => {
    const mockSession = {
      user: { id: 'user-123' },
      access_token: 'token-123',
    };

    beforeEach(() => {
      // Mock window.location.origin for URL construction
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://ideaspark.example.com' },
        writable: true,
      });
    });

    it('generates share link for authenticated user', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { share_id: 'share-uuid-456' },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.generateShareLink('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toBe('https://ideaspark.example.com/share/prototype/share-uuid-456');
      expect(mockFromChain.update).toHaveBeenCalledWith({
        is_public: true,
        shared_at: expect.any(String),
      });
      expect(mockFromChain.eq).toHaveBeenCalledWith('id', 'proto-789');
      expect(mockFromChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('returns error when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await prototypeService.generateShareLink('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('returns error when database update fails', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed', code: 'DB_ERROR' },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.generateShareLink('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to generate share link',
        code: 'DB_ERROR',
      });
    });

    it('handles unexpected errors gracefully', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error('Network error')
      );

      const result = await prototypeService.generateShareLink('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to generate share link',
        code: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('getPublicPrototype', () => {
    const mockPublicPrototypeRow = {
      id: 'proto-789',
      url: 'https://preview.example.com/proto-789',
      version: 2,
      status: 'ready' as const,
      created_at: '2024-01-01T00:00:00Z',
      share_id: 'share-uuid-123',
      view_count: 5,
      password_hash: null,
    };

    it('fetches public prototype by share_id successfully', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockPublicPrototypeRow,
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getPublicPrototype('share-uuid-123');

      expect(result.error).toBeNull();
      // Should return mapped PublicPrototype (camelCase, hasPassword boolean, no password_hash)
      expect(result.data).toEqual({
        id: 'proto-789',
        url: 'https://preview.example.com/proto-789',
        version: 2,
        status: 'ready',
        createdAt: '2024-01-01T00:00:00Z',
        shareId: 'share-uuid-123',
        hasPassword: false,
      });
      expect(mockFromChain.select).toHaveBeenCalledWith(
        'id, url, version, status, created_at, share_id, view_count, password_hash'
      );
      expect(mockFromChain.eq).toHaveBeenCalledWith('share_id', 'share-uuid-123');
      expect(mockFromChain.eq).toHaveBeenCalledWith('is_public', true);
      expect(mockFromChain.eq).toHaveBeenCalledWith('status', 'ready');
    });

    it('returns error when prototype not found', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getPublicPrototype('invalid-share-id');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Prototype not found or not public',
        code: 'NOT_FOUND',
      });
    });

    it('handles unexpected errors gracefully', async () => {
      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Network error')),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getPublicPrototype('share-uuid-123');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to load prototype',
        code: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('getShareStats', () => {
    const mockSession = {
      user: { id: 'user-123' },
      access_token: 'token-123',
    };

    it('returns share stats for authenticated user', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            view_count: 42,
            shared_at: '2026-01-15T10:00:00Z',
            is_public: true,
          },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getShareStats('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        viewCount: 42,
        sharedAt: '2026-01-15T10:00:00Z',
        isPublic: true,
      });
      expect(mockFromChain.select).toHaveBeenCalledWith('view_count, shared_at, is_public');
      expect(mockFromChain.eq).toHaveBeenCalledWith('id', 'proto-789');
      expect(mockFromChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('returns null when prototype not found (PGRST116)', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getShareStats('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });

    it('returns error when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await prototypeService.getShareStats('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('returns error when database query fails', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed', code: 'DB_ERROR' },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getShareStats('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to get share statistics',
        code: 'DB_ERROR',
      });
    });

    it('handles unexpected errors gracefully', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error('Network error')
      );

      const result = await prototypeService.getShareStats('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to get share statistics',
        code: 'UNKNOWN_ERROR',
      });
    });

    it('defaults view_count to 0 and is_public to false when null', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            view_count: null,
            shared_at: null,
            is_public: null,
          },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getShareStats('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        viewCount: 0,
        sharedAt: null,
        isPublic: false,
      });
    });
  });

  describe('getShareUrl', () => {
    const mockSession = {
      user: { id: 'user-123' },
      access_token: 'token-123',
    };

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://ideaspark.example.com' },
        writable: true,
      });
    });

    it('returns share URL for already shared prototype', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            share_id: 'share-uuid-789',
            is_public: true,
          },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getShareUrl('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toBe('https://ideaspark.example.com/share/prototype/share-uuid-789');
    });

    it('returns null when prototype not yet shared', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            share_id: 'share-uuid-789',
            is_public: false,
          },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getShareUrl('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });

    it('returns error when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await prototypeService.getShareUrl('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('returns error when database query fails', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed', code: 'DB_ERROR' },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getShareUrl('proto-789');

      expect(result.data).toBeNull();
      expect(result.error).toEqual({
        message: 'Failed to get share URL',
        code: 'DB_ERROR',
      });
    });
  });

  // =========================================================================
  // State Persistence (Story 8.2)
  // =========================================================================

  describe('saveState', () => {
    const mockValidState = createEmptyPrototypeState('proto-789');

    it('upserts state to database for authenticated user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const mockFromChain = {
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.saveState('proto-789', mockValidState);

      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('prototype_states');
      expect(mockFromChain.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          prototype_id: 'proto-789',
          user_id: 'user-123',
          state: mockValidState,
        }),
        { onConflict: 'prototype_id,user_id' },
      );
    });

    it('validates state schema before saving', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const invalidState = { invalid: 'data' } as unknown as PrototypeState;
      const result = await prototypeService.saveState('proto-789', invalidState);

      expect(result.error).toEqual({
        message: 'Invalid state schema',
        code: 'VALIDATION_ERROR',
      });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('returns auth error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await prototypeService.saveState('proto-789', mockValidState);

      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('returns DB error when upsert fails', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const mockFromChain = {
        upsert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upsert failed', code: 'DB_ERROR' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.saveState('proto-789', mockValidState);

      expect(result.error).toEqual({
        message: 'Upsert failed',
        code: 'DB_ERROR',
      });
    });

    it('handles unexpected errors gracefully', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'));

      const result = await prototypeService.saveState('proto-789', mockValidState);

      expect(result.error).toEqual({
        message: 'Failed to save state',
        code: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('getState', () => {
    const mockValidState = createEmptyPrototypeState('proto-789');

    it('loads saved state for authenticated user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { state: mockValidState },
          error: null,
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getState('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockValidState);
      expect(supabase.from).toHaveBeenCalledWith('prototype_states');
      expect(mockFromChain.eq).toHaveBeenCalledWith('prototype_id', 'proto-789');
      expect(mockFromChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('returns null when no saved state exists', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getState('proto-789');

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });

    it('validates schema of loaded state', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { state: { corrupted: 'data' } },
          error: null,
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getState('proto-789');

      expect(result.error).toEqual({
        message: 'Saved state has invalid schema',
        code: 'VALIDATION_ERROR',
      });
      expect(result.data).toBeNull();
    });

    it('returns auth error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await prototypeService.getState('proto-789');

      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('returns DB error when query fails', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed', code: 'DB_ERROR' },
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.getState('proto-789');

      expect(result.error).toEqual({
        message: 'Query failed',
        code: 'DB_ERROR',
      });
    });

    it('handles unexpected errors gracefully', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'));

      const result = await prototypeService.getState('proto-789');

      expect(result.error).toEqual({
        message: 'Failed to load state',
        code: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('deleteState', () => {
    it('deletes state row for authenticated user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      // Chain: from().delete().eq('prototype_id', ...).eq('user_id', ...)
      const secondEq = vi.fn().mockResolvedValue({ data: null, error: null });
      const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
      const mockFromChain = {
        delete: vi.fn().mockReturnValue({ eq: firstEq }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.deleteState('proto-789');

      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('prototype_states');
      expect(mockFromChain.delete).toHaveBeenCalled();
      expect(firstEq).toHaveBeenCalledWith('prototype_id', 'proto-789');
      expect(secondEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('returns auth error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await prototypeService.deleteState('proto-789');

      expect(result.error).toEqual({
        message: 'Not authenticated',
        code: 'AUTH_ERROR',
      });
    });

    it('returns DB error when delete fails', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: mockUser,
        error: null,
      } as any);

      const secondEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Delete failed', code: 'DB_ERROR' },
      });
      const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
      const mockFromChain = {
        delete: vi.fn().mockReturnValue({ eq: firstEq }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFromChain as any);

      const result = await prototypeService.deleteState('proto-789');

      expect(result.error).toEqual({
        message: 'Delete failed',
        code: 'DB_ERROR',
      });
    });

    it('handles unexpected errors gracefully', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'));

      const result = await prototypeService.deleteState('proto-789');

      expect(result.error).toEqual({
        message: 'Failed to delete state',
        code: 'UNKNOWN_ERROR',
      });
    });
  });
});
