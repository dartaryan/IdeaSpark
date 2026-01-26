// src/features/prototypes/components/VersionHistoryPanel.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import type { Prototype } from '../types';
import type { ReactNode } from 'react';

// Mock the hooks
vi.mock('../hooks/usePrototype', () => ({
  useVersionHistory: vi.fn(),
  prototypeKeys: {
    all: ['prototypes'],
    versionHistory: (prdId: string) => ['prototypes', 'prd', prdId, 'history'],
    byPrd: (prdId: string) => ['prototypes', 'prd', prdId],
    latestByPrd: (prdId: string) => ['prototypes', 'prd', prdId, 'latest'],
  },
}));

vi.mock('../hooks/useRestoreVersion', () => ({
  useRestoreVersion: vi.fn(),
}));

import { useVersionHistory } from '../hooks/usePrototype';
import { useRestoreVersion } from '../hooks/useRestoreVersion';

describe('VersionHistoryPanel', () => {
  let queryClient: QueryClient;
  const mockOnVersionSelect = vi.fn();

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

  const mockVersions: Prototype[] = [
    {
      id: 'proto-3',
      prdId: 'prd-123',
      ideaId: 'idea-456',
      userId: 'user-789',
      url: 'https://preview.example.com/proto-3',
      code: 'code v3',
      version: 3,
      refinementPrompt: 'Make it blue',
      status: 'ready',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
    {
      id: 'proto-2',
      prdId: 'prd-123',
      ideaId: 'idea-456',
      userId: 'user-789',
      url: 'https://preview.example.com/proto-2',
      code: 'code v2',
      version: 2,
      refinementPrompt: 'Add header',
      status: 'ready',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'proto-1',
      prdId: 'prd-123',
      ideaId: 'idea-456',
      userId: 'user-789',
      url: 'https://preview.example.com/proto-1',
      code: 'code v1',
      version: 1,
      refinementPrompt: null,
      status: 'ready',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('renders loading state', () => {
    vi.mocked(useVersionHistory).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    // Check for loading spinner by class
    expect(document.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('renders empty state when no versions exist', () => {
    vi.mocked(useVersionHistory).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId={null}
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('No versions available yet.')).toBeInTheDocument();
  });

  it('renders version history with multiple versions', () => {
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('3 versions')).toBeInTheDocument();
    expect(screen.getByText('"Make it blue"')).toBeInTheDocument();
    expect(screen.getByText('"Add header"')).toBeInTheDocument();
    expect(screen.getByText('Initial prototype')).toBeInTheDocument();
  });

  it('highlights active version', () => {
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    // Active version should have "Current" badge
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('shows restore button only for non-active versions', () => {
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    // Should have 2 restore buttons (for proto-2 and proto-1, not proto-3 which is active)
    const restoreButtons = screen.getAllByRole('button', { name: /restore/i });
    expect(restoreButtons).toHaveLength(2);
  });

  it('calls onVersionSelect when clicking on a version', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    // Click on version 2
    const version2Card = screen.getByText('"Add header"').closest('.card');
    await user.click(version2Card!);

    expect(mockOnVersionSelect).toHaveBeenCalledWith('proto-2');
  });

  it('opens confirmation modal when clicking restore button', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    // Click first restore button (for version 2)
    const restoreButtons = screen.getAllByRole('button', { name: /^restore$/i });
    await user.click(restoreButtons[0]);

    // Confirmation modal should appear
    expect(screen.getByText(/Restore Version 2\?/)).toBeInTheDocument();
    expect(screen.getByText(/This will create a new version \(v4\)/)).toBeInTheDocument();
  });

  it('handles version restoration successfully', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn().mockResolvedValue({
      id: 'proto-4',
      version: 4,
      status: 'ready',
    });
    
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    // Open confirmation modal
    const restoreButtons = screen.getAllByRole('button', { name: /^restore$/i });
    await user.click(restoreButtons[0]);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText(/Restore Version 2\?/)).toBeInTheDocument();
    });

    // Click "Restore Version" button - use getByText with exact match for the primary button text
    const confirmButton = screen.getByText('Restore Version', { selector: 'button' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        prototypeId: 'proto-2',
        prdId: 'prd-123',
      });
    });

    // Verify onVersionSelect was called with new prototype ID
    await waitFor(() => {
      expect(mockOnVersionSelect).toHaveBeenCalledWith('proto-4');
    });
  });

  it('cancels restoration when clicking cancel button', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = vi.fn();
    
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    // Open confirmation modal
    const restoreButtons = screen.getAllByRole('button', { name: /^restore$/i });
    await user.click(restoreButtons[0]);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText(/Restore Version 2\?/)).toBeInTheDocument();
    });

    // Click "Cancel" button - use getByText with selector
    const cancelButton = screen.getByText('Cancel', { selector: 'button' });
    await user.click(cancelButton);

    // Give time for state update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Modal should close
    expect(screen.queryByText(/Restore Version 2\?/)).not.toBeInTheDocument();
    
    // Mutation should not be called
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('displays error message when restoration fails', () => {
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    expect(screen.getByText('Failed to restore version. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('dismisses error message when clicking dismiss button', async () => {
    const user = userEvent.setup();
    const mockReset = vi.fn();
    
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      reset: mockReset,
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    await user.click(dismissButton);

    expect(mockReset).toHaveBeenCalled();
  });

  it('disables restore buttons while restoration is pending', () => {
    vi.mocked(useVersionHistory).mockReturnValue({
      data: mockVersions,
      isLoading: false,
    } as any);

    vi.mocked(useRestoreVersion).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      isError: false,
      reset: vi.fn(),
    } as any);

    render(
      <VersionHistoryPanel
        prdId="prd-123"
        activeVersionId="proto-3"
        onVersionSelect={mockOnVersionSelect}
      />,
      { wrapper }
    );

    const restoreButtons = screen.getAllByRole('button', { name: /restore/i });
    restoreButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
