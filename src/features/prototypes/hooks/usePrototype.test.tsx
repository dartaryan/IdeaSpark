import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  usePrototype,
  usePrototypesByPrd,
  useLatestPrototype,
  useVersionHistory,
  prototypeKeys,
} from './usePrototype';
import { prototypeService } from '../services/prototypeService';

// Mock the prototypeService
vi.mock('../services/prototypeService', () => ({
  prototypeService: {
    getById: vi.fn(),
    getByPrdId: vi.fn(),
    getLatestVersion: vi.fn(),
    getVersionHistory: vi.fn(),
  },
}));

const mockPrototypeService = vi.mocked(prototypeService);

const mockPrototype = {
  id: 'proto-123',
  prdId: 'prd-123',
  ideaId: 'idea-123',
  userId: 'user-123',
  url: 'https://example.com',
  code: 'const x = 1;',
  version: 1,
  refinementPrompt: null,
  status: 'ready' as const,
  createdAt: '2026-01-25T10:00:00Z',
  updatedAt: '2026-01-25T10:00:00Z',
};

describe('prototypeKeys', () => {
  it('should generate correct query keys', () => {
    expect(prototypeKeys.all).toEqual(['prototypes']);
    expect(prototypeKeys.lists()).toEqual(['prototypes', 'list']);
    expect(prototypeKeys.list('user-123')).toEqual(['prototypes', 'list', 'user-123']);
    expect(prototypeKeys.details()).toEqual(['prototypes', 'detail']);
    expect(prototypeKeys.detail('proto-123')).toEqual(['prototypes', 'detail', 'proto-123']);
    expect(prototypeKeys.byPrd('prd-123')).toEqual(['prototypes', 'prd', 'prd-123']);
    expect(prototypeKeys.latestByPrd('prd-123')).toEqual(['prototypes', 'prd', 'prd-123', 'latest']);
    expect(prototypeKeys.versionHistory('prd-123')).toEqual(['prototypes', 'prd', 'prd-123', 'history']);
  });
});

describe('usePrototype', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch prototype by ID successfully', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(prototypeService.getById).toHaveBeenCalledWith('proto-123');
    expect(result.current.data).toEqual(mockPrototype);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => usePrototype(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(prototypeService.getById).not.toHaveBeenCalled();
  });

  it('should handle error when fetching prototype', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'NOT_FOUND' },
    });

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe('usePrototypesByPrd', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch all prototypes for a PRD', async () => {
    const mockPrototypes = [mockPrototype, { ...mockPrototype, id: 'proto-124', version: 2 }];

    mockPrototypeService.getByPrdId.mockResolvedValue({
      data: mockPrototypes,
      error: null,
    });

    const { result } = renderHook(() => usePrototypesByPrd('prd-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(prototypeService.getByPrdId).toHaveBeenCalledWith('prd-123');
    expect(result.current.data).toEqual(mockPrototypes);
  });

  it('should not fetch when prdId is empty', () => {
    const { result } = renderHook(() => usePrototypesByPrd(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(prototypeService.getByPrdId).not.toHaveBeenCalled();
  });
});

describe('useLatestPrototype', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch latest prototype for a PRD', async () => {
    mockPrototypeService.getLatestVersion.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });

    const { result } = renderHook(() => useLatestPrototype('prd-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(prototypeService.getLatestVersion).toHaveBeenCalledWith('prd-123');
    expect(result.current.data).toEqual(mockPrototype);
  });

  it('should not fetch when prdId is empty', () => {
    const { result } = renderHook(() => useLatestPrototype(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(prototypeService.getLatestVersion).not.toHaveBeenCalled();
  });
});

describe('useVersionHistory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch version history for a PRD', async () => {
    const mockVersions = [
      { ...mockPrototype, version: 2 },
      { ...mockPrototype, version: 1 },
    ];

    mockPrototypeService.getVersionHistory.mockResolvedValue({
      data: mockVersions,
      error: null,
    });

    const { result } = renderHook(() => useVersionHistory('prd-123'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(prototypeService.getVersionHistory).toHaveBeenCalledWith('prd-123');
    expect(result.current.data).toEqual(mockVersions);
  });

  it('should not fetch when prdId is empty', () => {
    const { result } = renderHook(() => useVersionHistory(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(prototypeService.getVersionHistory).not.toHaveBeenCalled();
  });
});
