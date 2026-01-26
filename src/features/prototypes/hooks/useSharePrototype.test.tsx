import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSharePrototype } from './useSharePrototype';
import { prototypeService } from '../services/prototypeService';

// Mock the prototypeService
vi.mock('../services/prototypeService', () => ({
  prototypeService: {
    generateShareLink: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

const mockPrototypeService = vi.mocked(prototypeService);
const mockClipboard = vi.mocked(navigator.clipboard);

describe('useSharePrototype', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('generates share link successfully', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';
    
    mockPrototypeService.generateShareLink.mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSharePrototype(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-123',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(prototypeService.generateShareLink).toHaveBeenCalledWith('proto-123');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareUrl);
    expect(result.current.data).toBe(shareUrl);
  });

  it('handles clipboard write failure gracefully', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    mockPrototypeService.generateShareLink.mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard access denied'));

    const { result } = renderHook(() => useSharePrototype(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-123',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(shareUrl);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error));
    
    consoleWarnSpy.mockRestore();
  });

  it('handles service error', async () => {
    mockPrototypeService.generateShareLink.mockResolvedValue({
      data: null,
      error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
    });

    const { result } = renderHook(() => useSharePrototype(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-123',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  it('invalidates prototype queries on success', async () => {
    const shareUrl = 'https://ideaspark.example.com/share/prototype/share-uuid-123';
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    
    mockPrototypeService.generateShareLink.mockResolvedValue({
      data: shareUrl,
      error: null,
    });

    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSharePrototype(), { wrapper });

    result.current.mutate({
      prototypeId: 'proto-123',
      prdId: 'prd-123',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should invalidate version history and detail queries
    expect(invalidateQueriesSpy).toHaveBeenCalled();
  });
});
