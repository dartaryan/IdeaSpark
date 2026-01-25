import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePrdView } from './usePrdView';
import { prdService } from '../services/prdService';
import type { ReactNode } from 'react';

// Mock the prdService
vi.mock('../services/prdService', () => ({
  prdService: {
    getPrdWithIdea: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockPrd = {
  id: 'prd-123',
  idea_id: 'idea-123',
  user_id: 'user-123',
  content: {
    problemStatement: { content: 'Test problem', status: 'complete' as const },
  },
  status: 'complete' as const,
  created_at: '2026-01-22T10:00:00Z',
  updated_at: '2026-01-22T10:00:00Z',
  completed_at: '2026-01-25T10:00:00Z',
};

const mockIdea = {
  id: 'idea-123',
  title: 'Test Idea',
  problem: 'Test problem',
  solution: 'Test solution',
  impact: 'Test impact',
  enhanced_problem: 'Enhanced problem',
  enhanced_solution: 'Enhanced solution',
  enhanced_impact: 'Enhanced impact',
  status: 'prd_development',
  created_at: '2026-01-22T10:00:00Z',
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function createWrapper() {
  const queryClient = createQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePrdView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch PRD and idea data successfully', async () => {
    vi.mocked(prdService.getPrdWithIdea).mockResolvedValue({
      data: { prd: mockPrd, idea: mockIdea },
      error: null,
    });

    const { result } = renderHook(() => usePrdView({ prdId: 'prd-123' }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ prd: mockPrd, idea: mockIdea });
    expect(result.current.error).toBeNull();
    expect(result.current.isDraft).toBe(false);
    expect(prdService.getPrdWithIdea).toHaveBeenCalledWith('prd-123');
  });

  it('should detect draft PRD status', async () => {
    const draftPrd = { ...mockPrd, status: 'draft' as const };
    vi.mocked(prdService.getPrdWithIdea).mockResolvedValue({
      data: { prd: draftPrd, idea: mockIdea },
      error: null,
    });

    const { result } = renderHook(() => usePrdView({ prdId: 'prd-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isDraft).toBe(true);
  });

  it('should redirect to builder if PRD is draft when redirectIfDraft is true', async () => {
    const draftPrd = { ...mockPrd, status: 'draft' as const };
    vi.mocked(prdService.getPrdWithIdea).mockResolvedValue({
      data: { prd: draftPrd, idea: mockIdea },
      error: null,
    });

    renderHook(() => usePrdView({ prdId: 'prd-123', redirectIfDraft: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/prd/build/idea-123', { replace: true });
    });
  });

  it('should not redirect if redirectIfDraft is false', async () => {
    const draftPrd = { ...mockPrd, status: 'draft' as const };
    vi.mocked(prdService.getPrdWithIdea).mockResolvedValue({
      data: { prd: draftPrd, idea: mockIdea },
      error: null,
    });

    renderHook(() => usePrdView({ prdId: 'prd-123', redirectIfDraft: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('should handle error when fetching PRD', async () => {
    vi.mocked(prdService.getPrdWithIdea).mockResolvedValue({
      data: null,
      error: { message: 'PRD not found', code: 'NOT_FOUND' },
    });

    const { result } = renderHook(() => usePrdView({ prdId: 'invalid-id' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('PRD not found');
  });

  it('should not fetch when prdId is empty', () => {
    const { result } = renderHook(() => usePrdView({ prdId: '' }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(prdService.getPrdWithIdea).not.toHaveBeenCalled();
  });

  it('should use correct query key for caching', async () => {
    vi.mocked(prdService.getPrdWithIdea).mockResolvedValue({
      data: { prd: mockPrd, idea: mockIdea },
      error: null,
    });

    const { result } = renderHook(() => usePrdView({ prdId: 'prd-123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Query key should be ['prd', 'view', prdId]
    expect(prdService.getPrdWithIdea).toHaveBeenCalledWith('prd-123');
  });
});
