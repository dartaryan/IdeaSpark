// src/features/prototypes/hooks/useSaveVersion.test.tsx
// Unit tests for useSaveVersion hook (Story 7.4)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSaveVersion } from './useSaveVersion';
import { prototypeService } from '../services/prototypeService';
import toast from 'react-hot-toast';
import type { Prototype } from '../types';

// Mock prototypeService
vi.mock('../services/prototypeService', () => ({
  prototypeService: {
    createVersion: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockCreateVersion = vi.mocked(prototypeService.createVersion);
const mockUpdate = vi.mocked(prototypeService.update);

const mockPrototype: Prototype = {
  id: 'new-version-id',
  prdId: 'prd-1',
  ideaId: 'idea-1',
  userId: 'user-1',
  url: null,
  code: '{"\\"/App.tsx\\"":"console.log()"}',
  version: 4,
  refinementPrompt: 'My note',
  status: 'generating',
  createdAt: '2026-02-07T00:00:00Z',
  updatedAt: '2026-02-07T00:00:00Z',
  shareId: 'share-1',
  isPublic: false,
  sharedAt: null,
  viewCount: 0,
};

const defaultProps = {
  prototypeId: 'proto-1',
  currentFiles: {
    '/App.tsx': { path: '/App.tsx', content: 'const App = () => <div>Hi</div>;', language: 'typescript' },
  },
  prdId: 'prd-1',
  ideaId: 'idea-1',
};

describe('useSaveVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockCreateVersion.mockResolvedValue({ data: mockPrototype, error: null });
    mockUpdate.mockResolvedValue({ data: { ...mockPrototype, status: 'ready' }, error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should return idle status initially', () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      expect(result.current.status).toBe('idle');
      expect(result.current.isSaving).toBe(false);
    });

    it('should return saveVersion function', () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      expect(typeof result.current.saveVersion).toBe('function');
    });
  });

  describe('Successful Version Save', () => {
    it('should call createVersion with correct parameters', async () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion('My changes');
      });

      expect(mockCreateVersion).toHaveBeenCalledWith({
        prdId: 'prd-1',
        ideaId: 'idea-1',
        code: expect.any(String),
        refinementPrompt: 'My changes',
      });
    });

    it('should serialize files before saving', async () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion();
      });

      const call = mockCreateVersion.mock.calls[0][0];
      // Code should be JSON-serialized
      const parsed = JSON.parse(call.code!);
      expect(parsed['/App.tsx']).toBe('const App = () => <div>Hi</div>;');
    });

    it('should return new prototype ID on success', async () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      let newId: string | null = null;
      await act(async () => {
        newId = await result.current.saveVersion();
      });

      expect(newId).toBe('new-version-id');
    });

    it('should update status to success after save', async () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(result.current.status).toBe('success');
    });

    it('should call update to set status to ready after createVersion', async () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(mockUpdate).toHaveBeenCalledWith('new-version-id', { status: 'ready' });
    });

    it('should use empty string for refinementPrompt when no note provided', async () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(mockCreateVersion).toHaveBeenCalledWith(
        expect.objectContaining({ refinementPrompt: '' }),
      );
    });
  });

  describe('Status Transitions', () => {
    it('should transition: idle → saving → success → idle', async () => {
      const { result } = renderHook(() => useSaveVersion(defaultProps));

      expect(result.current.status).toBe('idle');

      let savePromise: Promise<string | null>;
      await act(async () => {
        savePromise = result.current.saveVersion();
      });

      // After completion
      await act(async () => {
        await savePromise!;
      });
      expect(result.current.status).toBe('success');

      // After 3-second timer
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.status).toBe('idle');
    });

    it('should transition: idle → saving → error → idle on failure', async () => {
      mockCreateVersion.mockResolvedValueOnce({
        data: null,
        error: { message: 'DB error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(result.current.status).toBe('error');

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.status).toBe('idle');
    });

    it('should set isSaving=true during save operation', async () => {
      let resolveSave: ((v: unknown) => void) | undefined;
      mockCreateVersion.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
      );

      const { result } = renderHook(() => useSaveVersion(defaultProps));

      // Start save but don't await
      act(() => {
        result.current.saveVersion();
      });

      // Status should be saving while promise is pending
      expect(result.current.isSaving).toBe(true);
      expect(result.current.status).toBe('saving');

      // Resolve the promise
      await act(async () => {
        resolveSave!({ data: mockPrototype, error: null });
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should return null on createVersion failure', async () => {
      mockCreateVersion.mockResolvedValueOnce({
        data: null,
        error: { message: 'Network error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSaveVersion(defaultProps));

      let newId: string | null = null;
      await act(async () => {
        newId = await result.current.saveVersion();
      });

      expect(newId).toBeNull();
    });

    it('should show toast error on failure', async () => {
      mockCreateVersion.mockResolvedValueOnce({
        data: null,
        error: { message: 'Network error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to save version: Network error');
    });

    it('should handle exception gracefully', async () => {
      mockCreateVersion.mockRejectedValueOnce(new Error('Unexpected crash'));

      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(result.current.status).toBe('error');
      expect(toast.error).toHaveBeenCalledWith('Failed to save version: Unexpected crash');
    });

    it('should show error when prototypeId is missing', async () => {
      const { result } = renderHook(() =>
        useSaveVersion({ ...defaultProps, prototypeId: '' }),
      );

      let newId: string | null = null;
      await act(async () => {
        newId = await result.current.saveVersion();
      });

      expect(newId).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Missing required data to save version.');
    });

    it('should show error when prdId is missing', async () => {
      const { result } = renderHook(() =>
        useSaveVersion({ ...defaultProps, prdId: '' }),
      );

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(toast.error).toHaveBeenCalledWith('Missing required data to save version.');
    });

    it('should show error when currentFiles is empty', async () => {
      const { result } = renderHook(() =>
        useSaveVersion({ ...defaultProps, currentFiles: {} }),
      );

      await act(async () => {
        await result.current.saveVersion();
      });

      expect(toast.error).toHaveBeenCalledWith('No files to save.');
    });
  });

  describe('Retry after Error', () => {
    it('should allow retry after error', async () => {
      // First call fails
      mockCreateVersion.mockResolvedValueOnce({
        data: null,
        error: { message: 'Temp error', code: 'DB_ERROR' },
      });

      const { result } = renderHook(() => useSaveVersion(defaultProps));

      await act(async () => {
        await result.current.saveVersion('attempt 1');
      });
      expect(result.current.status).toBe('error');

      // Second call succeeds
      mockCreateVersion.mockResolvedValueOnce({ data: mockPrototype, error: null });

      let newId: string | null = null;
      await act(async () => {
        newId = await result.current.saveVersion('attempt 2');
      });
      expect(newId).toBe('new-version-id');
      expect(result.current.status).toBe('success');
    });
  });
});
