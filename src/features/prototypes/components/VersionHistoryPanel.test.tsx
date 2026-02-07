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

  // --- Story 7.5: Compare feature tests (Code Review H1) ---

  describe('Compare selection (Story 7.5)', () => {
    const mockOnCompare = vi.fn();

    function renderWithCompare(activeVersionId = 'proto-3') {
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

      return render(
        <VersionHistoryPanel
          prdId="prd-123"
          activeVersionId={activeVersionId}
          onVersionSelect={mockOnVersionSelect}
          onCompare={mockOnCompare}
        />,
        { wrapper },
      );
    }

    it('renders compare checkboxes when onCompare is provided', () => {
      renderWithCompare();

      // Each version should have a compare checkbox
      expect(screen.getByTestId('compare-checkbox-proto-3')).toBeInTheDocument();
      expect(screen.getByTestId('compare-checkbox-proto-2')).toBeInTheDocument();
      expect(screen.getByTestId('compare-checkbox-proto-1')).toBeInTheDocument();
    });

    it('renders "Compare (0/2)" button when onCompare is provided', () => {
      renderWithCompare();

      const compareBtn = screen.getByTestId('compare-selected-btn');
      expect(compareBtn).toBeInTheDocument();
      expect(compareBtn).toHaveTextContent('Compare (0/2)');
      expect(compareBtn).toBeDisabled();
    });

    it('disables compare button when fewer than 2 versions selected', async () => {
      const user = userEvent.setup();
      renderWithCompare();

      // Select one version
      await user.click(screen.getByTestId('compare-checkbox-proto-1'));

      const compareBtn = screen.getByTestId('compare-selected-btn');
      expect(compareBtn).toHaveTextContent('Compare (1/2)');
      expect(compareBtn).toBeDisabled();
    });

    it('enables compare button when exactly 2 versions selected', async () => {
      const user = userEvent.setup();
      renderWithCompare();

      await user.click(screen.getByTestId('compare-checkbox-proto-1'));
      await user.click(screen.getByTestId('compare-checkbox-proto-2'));

      const compareBtn = screen.getByTestId('compare-selected-btn');
      expect(compareBtn).toHaveTextContent('Compare (2/2)');
      expect(compareBtn).not.toBeDisabled();
    });

    it('calls onCompare with sorted version IDs (older first) when compare clicked', async () => {
      const user = userEvent.setup();
      renderWithCompare();

      // Select v3 first, then v1 — should still pass v1 (older) as A
      await user.click(screen.getByTestId('compare-checkbox-proto-3'));
      await user.click(screen.getByTestId('compare-checkbox-proto-1'));

      await user.click(screen.getByTestId('compare-selected-btn'));

      expect(mockOnCompare).toHaveBeenCalledWith('proto-1', 'proto-3');
    });

    it('clears selection when Clear button is clicked', async () => {
      const user = userEvent.setup();
      renderWithCompare();

      // Select two versions
      await user.click(screen.getByTestId('compare-checkbox-proto-1'));
      await user.click(screen.getByTestId('compare-checkbox-proto-2'));

      // Clear button should appear
      const clearBtn = screen.getByTestId('clear-compare-selection');
      expect(clearBtn).toBeInTheDocument();
      await user.click(clearBtn);

      // Button should go back to 0/2
      expect(screen.getByTestId('compare-selected-btn')).toHaveTextContent('Compare (0/2)');
    });

    it('replaces oldest selection when selecting a third version', async () => {
      const user = userEvent.setup();
      renderWithCompare();

      // Select two versions
      await user.click(screen.getByTestId('compare-checkbox-proto-1'));
      await user.click(screen.getByTestId('compare-checkbox-proto-2'));

      // Select a third - should replace proto-1 (oldest selection)
      await user.click(screen.getByTestId('compare-checkbox-proto-3'));

      // Should still show 2/2 (proto-2 and proto-3)
      expect(screen.getByTestId('compare-selected-btn')).toHaveTextContent('Compare (2/2)');
    });

    it('shows "Compare with current" button for non-active versions', () => {
      renderWithCompare();

      // Non-active versions (proto-2 and proto-1) should have "compare with current" buttons
      expect(screen.getByTestId('compare-with-current-proto-2')).toBeInTheDocument();
      expect(screen.getByTestId('compare-with-current-proto-1')).toBeInTheDocument();
      // Active version (proto-3) should NOT have it
      expect(screen.queryByTestId('compare-with-current-proto-3')).not.toBeInTheDocument();
    });

    it('calls onCompare when "Compare with current" is clicked', async () => {
      const user = userEvent.setup();
      renderWithCompare();

      await user.click(screen.getByTestId('compare-with-current-proto-1'));

      // Should compare proto-1 (old) with proto-3 (active/current)
      expect(mockOnCompare).toHaveBeenCalledWith('proto-1', 'proto-3');
    });

    it('does not render compare checkboxes when onCompare is not provided', () => {
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
        { wrapper },
      );

      expect(screen.queryByTestId('compare-checkbox-proto-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('compare-selected-btn')).not.toBeInTheDocument();
    });

    it('applies secondary ring highlight on selected compare versions', async () => {
      const user = userEvent.setup();
      renderWithCompare();

      await user.click(screen.getByTestId('compare-checkbox-proto-1'));

      // The wrapper div around the selected version should have ring-2 ring-secondary
      const checkbox = screen.getByTestId('compare-checkbox-proto-1');
      const itemWrapper = checkbox.closest('.relative')?.querySelector('.ring-2');
      expect(itemWrapper).toBeInTheDocument();
    });
  });
});
