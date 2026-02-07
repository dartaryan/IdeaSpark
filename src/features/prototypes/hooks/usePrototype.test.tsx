import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
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
    getState: vi.fn(),
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
    // Default mock for getState (Story 8.3) - no saved state
    mockPrototypeService.getState.mockResolvedValue({ data: null, error: null });
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

// ===========================================================================
// Story 8.3: State loading tests for usePrototype
// ===========================================================================

describe('usePrototype - saved state loading (Story 8.3)', () => {
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

  const mockSavedState = {
    version: '1.0',
    timestamp: '2026-02-07T10:00:00Z',
    prototypeId: 'proto-123',
    route: { pathname: '/dashboard', search: '', hash: '', state: null },
    forms: {},
    components: {},
    localStorage: {},
    metadata: {
      captureDurationMs: 5,
      serializedSizeBytes: 200,
      capturedAt: '2026-02-07T10:00:00Z',
      captureMethod: 'auto' as const,
    },
  };

  it('should load saved state via getState() on mount', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });
    mockPrototypeService.getState.mockResolvedValue({
      data: mockSavedState,
      error: null,
    });

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.stateLoadStatus).toBe('loaded');
    });

    expect(prototypeService.getState).toHaveBeenCalledWith('proto-123');
    expect(result.current.savedState).toEqual(mockSavedState);
  });

  it('should set stateLoadStatus to loading initially', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });
    // Delay getState resolution to observe loading state
    mockPrototypeService.getState.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.stateLoadStatus).toBe('loading');
    });
  });

  it('should handle getState() error gracefully', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });
    mockPrototypeService.getState.mockResolvedValue({
      data: null,
      error: { message: 'DB connection failed', code: 'DB_ERROR' },
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.stateLoadStatus).toBe('error');
    });

    expect(result.current.savedState).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to load saved state:',
      'DB connection failed',
    );

    consoleWarnSpy.mockRestore();
  });

  it('should return null savedState when no state exists', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });
    mockPrototypeService.getState.mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.stateLoadStatus).toBe('loaded');
    });

    expect(result.current.savedState).toBeNull();
  });

  it('should not call getState when id is empty', () => {
    const { result } = renderHook(() => usePrototype(''), { wrapper });

    expect(result.current.stateLoadStatus).toBe('idle');
    expect(prototypeService.getState).not.toHaveBeenCalled();
  });

  it('should discard state that fails schema validation (review fix H2)', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });
    // Return invalid state (missing required fields)
    mockPrototypeService.getState.mockResolvedValue({
      data: { version: '1.0', timestamp: 'now' } as any, // Invalid: missing route, forms, etc.
      error: null,
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.stateLoadStatus).toBe('loaded');
    });

    expect(result.current.savedState).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Loaded state failed schema validation, discarding',
    );

    consoleWarnSpy.mockRestore();
  });

  it('should expose clearSavedState that resets savedState to null (review fix H1)', async () => {
    mockPrototypeService.getById.mockResolvedValue({
      data: mockPrototype,
      error: null,
    });
    mockPrototypeService.getState.mockResolvedValue({
      data: mockSavedState,
      error: null,
    });

    const { result } = renderHook(() => usePrototype('proto-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.savedState).toEqual(mockSavedState);
    });

    // Call clearSavedState
    act(() => {
      result.current.clearSavedState();
    });

    expect(result.current.savedState).toBeNull();
  });
});
