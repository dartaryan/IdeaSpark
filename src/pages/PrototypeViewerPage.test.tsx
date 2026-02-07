import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { PrototypeViewerPage } from './PrototypeViewerPage';
import { usePrototype, useVersionHistory } from '../features/prototypes/hooks/usePrototype';
import type { Prototype } from '../features/prototypes/types';

// Mock the prototype hooks
vi.mock('../features/prototypes/hooks/usePrototype');

// Mock useParams, useNavigate, and useSearchParams
const mockNavigate = vi.fn();
const mockParams = { prototypeId: 'proto-1' };
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

// Mock components that don't exist yet
vi.mock('../features/prototypes/components/PrototypeFrame', () => ({
  PrototypeFrame: ({ url }: { url: string }) => (
    <div data-testid="prototype-frame">Frame: {url}</div>
  ),
}));

vi.mock('../features/prototypes/components/DeviceSelector', () => ({
  DeviceSelector: () => <div data-testid="device-selector">Device Selector</div>,
  DEVICE_PRESETS: [
    { id: 'desktop', label: 'Desktop', width: 1920, height: 1080 },
  ],
}));

vi.mock('../features/prototypes/components/PrototypeMetadata', () => ({
  PrototypeMetadata: () => <div data-testid="prototype-metadata">Metadata</div>,
}));

vi.mock('../features/prototypes/components/RefinementChat', () => ({
  RefinementChat: () => <div data-testid="refinement-chat">Refinement Chat</div>,
}));

vi.mock('../features/prototypes/components/RefinementHistoryItem', () => ({
  RefinementHistoryItem: () => <div data-testid="refinement-history-item">History Item</div>,
}));

vi.mock('../features/prototypes/components/VersionHistoryPanel', () => ({
  VersionHistoryPanel: ({ onVersionSelect, onCompare, activeVersionId }: {
    onVersionSelect: (id: string) => void;
    onCompare?: (a: string, b: string) => void;
    activeVersionId: string | null;
  }) => (
    <div data-testid="version-history-panel">
      <span data-testid="active-version-id">{activeVersionId}</span>
      <button data-testid="select-version-btn" onClick={() => onVersionSelect('proto-old')}>
        Select Old Version
      </button>
      {onCompare && (
        <button data-testid="open-compare-btn" onClick={() => onCompare('proto-old', 'proto-1')}>
          Compare
        </button>
      )}
    </div>
  ),
}));

vi.mock('../features/prototypes/components/ShareButton', () => ({
  ShareButton: () => <div data-testid="share-button">Share</div>,
}));

vi.mock('../features/prototypes/components/CodeEditorPanel', () => ({
  CodeEditorPanel: () => <div data-testid="code-editor-panel">Code Editor</div>,
}));

vi.mock('../features/prototypes/components/SaveVersionModal', () => ({
  SaveVersionModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="save-version-modal">Save Version Modal</div> : null,
}));

vi.mock('../features/prototypes/components/VersionCompareModal', () => ({
  VersionCompareModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="version-compare-modal">
        Compare Modal
        <button data-testid="close-compare-modal" onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('../features/prototypes/components/SandpackLivePreview', () => ({
  SandpackLivePreview: () => <div data-testid="sandpack-preview">Live Preview</div>,
}));

vi.mock('../features/prototypes/hooks/useCodePersistence', () => ({
  useCodePersistence: () => ({
    files: {},
    updateFile: vi.fn(),
    saveStatus: 'idle' as const,
    hasUnsavedChanges: false,
    flushSave: vi.fn(),
  }),
}));

vi.mock('../features/prototypes/hooks/useSaveVersion', () => ({
  useSaveVersion: () => ({
    saveVersion: vi.fn(),
    status: 'idle',
    isSaving: false,
  }),
}));

vi.mock('../features/prototypes/utils/editorHelpers', () => ({
  loadEditorWidth: () => 50,
  saveEditorWidth: vi.fn(),
}));

// Mock state bridge hook (Story 8.1)
const mockStateBridge = {
  capturedState: null as any,
  isListening: false,
  lastError: null as Error | null,
  lastUpdateTime: null as number | null,
};
vi.mock('../features/prototypes/hooks/useSandpackStateBridge', () => ({
  useSandpackStateBridge: () => mockStateBridge,
}));

// Mock state capture performance hook (Story 8.1, Task 9)
vi.mock('../features/prototypes/hooks/useStateCapturePerformance', () => ({
  useStateCapturePerformance: () => ({
    recordCapture: vi.fn(),
    getRecentEntries: vi.fn().mockReturnValue([]),
    getAverageCaptureDuration: vi.fn().mockReturnValue(0),
  }),
}));

// Mock state persistence hook (Story 8.2)
const mockStatePersistence = {
  saveStatus: 'idle' as 'idle' | 'saving' | 'saved' | 'error',
  lastSavedAt: null as Date | null,
  lastError: null as Error | null,
  saveNow: vi.fn(),
};
vi.mock('../features/prototypes/hooks/useStatePersistence', () => ({
  useStatePersistence: () => mockStatePersistence,
}));

// Mock StatePersistenceIndicator (Story 8.2)
vi.mock('../features/prototypes/components/StatePersistenceIndicator', () => ({
  StatePersistenceIndicator: ({ status, lastSavedAt: _lastSavedAt }: { status: string; lastSavedAt: Date | null }) => (
    <span data-testid="state-persistence-indicator" data-status={status}>
      {status === 'saving' && 'Saving...'}
      {status === 'saved' && 'State saved'}
      {status === 'error' && 'State save failed'}
      {status === 'idle' && 'State sync idle'}
    </span>
  ),
}));

const mockPrototype: Prototype = {
  id: 'proto-1',
  prdId: 'prd-1',
  ideaId: 'idea-1',
  userId: 'user-1',
  url: 'https://example.com/prototype',
  code: null,
  version: 1,
  refinementPrompt: null,
  status: 'ready',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  shareId: 'share-1',
  isPublic: false,
  sharedAt: null,
  viewCount: 0,
};

const mockVersionHistory: Prototype[] = [
  {
    ...mockPrototype,
    id: 'proto-2',
    version: 2,
    code: '{"App.tsx":"console.log(\\"v2\\")"}',
    refinementPrompt: 'Updated version',
  },
  {
    ...mockPrototype,
    id: 'proto-1',
    version: 1,
    code: '{"App.tsx":"console.log(\\"v1\\")"}',
  },
];

describe('PrototypeViewerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset state bridge mock
    mockStateBridge.capturedState = null;
    mockStateBridge.isListening = false;
    mockStateBridge.lastError = null;
    mockStateBridge.lastUpdateTime = null;
    // Mock useVersionHistory to return empty array by default
    vi.mocked(useVersionHistory).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  const renderPage = (prototypeId: string = 'proto-1') => {
    mockParams.prototypeId = prototypeId;
    return render(<PrototypeViewerPage />);
  };

  describe('Loading State (AC 6)', () => {
    it('should show loading spinner while fetching prototype', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByText(/loading prototype/i)).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // loading spinner
    });

    it('should show loading message', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByText(/loading prototype/i)).toBeInTheDocument();
    });
  });

  describe('Success State (AC 1, 5)', () => {
    it('should render prototype frame when data loads successfully', async () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: mockPrototype,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('prototype-frame')).toBeInTheDocument();
        expect(screen.getByText(/frame:.*example\.com/i)).toBeInTheDocument();
      });
    });

    it('should render device selector', async () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: mockPrototype,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('device-selector')).toBeInTheDocument();
      });
    });

    it('should render prototype metadata', async () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: mockPrototype,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('prototype-metadata')).toBeInTheDocument();
      });
    });
  });

  describe('Error States (AC 7)', () => {
    it('should show error message when prototype not found', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Prototype not found'),
        isError: true,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByRole('heading', { name: /prototype not found/i })).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load'),
        isError: true,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should show back to ideas button on error', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load'),
        isError: true,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByRole('button', { name: /back to.*ideas/i })).toBeInTheDocument();
    });
  });

  describe('Status Handling', () => {
    it('should show generating message when prototype is still generating', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: { ...mockPrototype, status: 'generating' },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByText(/prototype generating/i)).toBeInTheDocument();
    });

    it('should show failed message when generation failed', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: { ...mockPrototype, status: 'failed' },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByRole('heading', { name: /generation failed/i })).toBeInTheDocument();
    });

    it('should show error when URL is missing even if status is ready', () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: { ...mockPrototype, url: null },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      expect(screen.getByText(/url missing/i)).toBeInTheDocument();
    });
  });

  describe('Navigation (AC 5)', () => {
    it('should provide navigation back to PRD', async () => {
      vi.mocked(usePrototype).mockReturnValue({
        data: { ...mockPrototype, status: 'generating' },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();
      
      const backButton = screen.getByRole('button', { name: /back to prd/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  // --- Story 7.5: Compare modal and version switching tests (Code Review H2) ---

  describe('Compare Modal Flow (Story 7.5)', () => {
    function renderWithVersions() {
      vi.mocked(usePrototype).mockReturnValue({
        data: mockPrototype,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useVersionHistory).mockReturnValue({
        data: mockVersionHistory,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      return renderPage();
    }

    it('should render VersionHistoryPanel with onCompare prop', () => {
      renderWithVersions();

      expect(screen.getByTestId('version-history-panel')).toBeInTheDocument();
      // The mock renders the "Compare" button only when onCompare is provided
      expect(screen.getByTestId('open-compare-btn')).toBeInTheDocument();
    });

    it('should open compare modal when VersionHistoryPanel triggers compare', async () => {
      const user = userEvent.setup();
      renderWithVersions();

      // Click the compare button from the mocked VersionHistoryPanel
      await user.click(screen.getByTestId('open-compare-btn'));

      // Compare modal should open
      expect(screen.getByTestId('version-compare-modal')).toBeInTheDocument();
    });

    it('should close compare modal when close callback fires', async () => {
      const user = userEvent.setup();
      renderWithVersions();

      // Open compare modal
      await user.click(screen.getByTestId('open-compare-btn'));
      expect(screen.getByTestId('version-compare-modal')).toBeInTheDocument();

      // Close it
      await user.click(screen.getByTestId('close-compare-modal'));
      expect(screen.queryByTestId('version-compare-modal')).not.toBeInTheDocument();
    });
  });

  describe('Version Switching UX (Story 7.5)', () => {
    function renderWithVersions() {
      vi.mocked(usePrototype).mockReturnValue({
        data: mockPrototype,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useVersionHistory).mockReturnValue({
        data: mockVersionHistory,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      return renderPage();
    }

    it('should show version badge', () => {
      renderWithVersions();

      expect(screen.getByTestId('version-badge')).toBeInTheDocument();
    });

    it('should show "Viewing old version" badge and "Return to Latest" when viewing non-latest', async () => {
      const user = userEvent.setup();
      renderWithVersions();

      // Switch to an old version via the mocked VersionHistoryPanel
      await user.click(screen.getByTestId('select-version-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('viewing-old-version-badge')).toBeInTheDocument();
        expect(screen.getByTestId('return-to-latest-btn')).toBeInTheDocument();
      });
    });

    it('should disable Edit Code button when viewing non-latest version', async () => {
      const user = userEvent.setup();

      vi.mocked(usePrototype).mockReturnValue({
        data: { ...mockPrototype, code: '{"App.tsx":"code"}' },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useVersionHistory).mockReturnValue({
        data: mockVersionHistory,
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      renderPage();

      // Switch to old version
      await user.click(screen.getByTestId('select-version-btn'));

      await waitFor(() => {
        const editBtn = screen.getByTestId('edit-code-btn');
        expect(editBtn).toBeDisabled();
      });
    });

    it('should return to latest version when "Return to Latest" is clicked', async () => {
      const user = userEvent.setup();
      renderWithVersions();

      // Switch to old version
      await user.click(screen.getByTestId('select-version-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('return-to-latest-btn')).toBeInTheDocument();
      });

      // Click return to latest
      await user.click(screen.getByTestId('return-to-latest-btn'));

      // The old-version badge should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('viewing-old-version-badge')).not.toBeInTheDocument();
      });
    });
  });

  // --- Story 8.1: State capture integration tests ---

  describe('State Capture Indicator (Story 8.1)', () => {
    function renderWithCode() {
      vi.mocked(usePrototype).mockReturnValue({
        data: { ...mockPrototype, code: '{"App.tsx":"console.log()"}' },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useVersionHistory).mockReturnValue({
        data: [{ ...mockPrototype, code: '{"App.tsx":"console.log()"}' }],
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      return renderPage();
    }

    it('should not show state capture indicator when not in edit mode', () => {
      renderWithCode();

      expect(screen.queryByTestId('state-capture-indicator')).not.toBeInTheDocument();
    });

    it('should show state capture indicator when in edit mode', async () => {
      const user = userEvent.setup();
      renderWithCode();

      // Enter edit mode
      const editBtn = screen.getByTestId('edit-code-btn');
      await user.click(editBtn);

      await waitFor(() => {
        expect(screen.getByTestId('state-capture-indicator')).toBeInTheDocument();
      });
    });

    it('should show "State synced" when lastUpdateTime is set', async () => {
      mockStateBridge.isListening = true;
      mockStateBridge.lastUpdateTime = Date.now();

      const user = userEvent.setup();
      renderWithCode();

      // Enter edit mode
      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        expect(screen.getByText(/state synced/i)).toBeInTheDocument();
      });
    });

    it('should show error state when state capture has an error', async () => {
      mockStateBridge.isListening = true;
      mockStateBridge.lastError = new Error('Bridge error');

      const user = userEvent.setup();
      renderWithCode();

      // Enter edit mode
      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        expect(screen.getByText(/state capture error/i)).toBeInTheDocument();
      });
    });

    it('should show "Waiting for state..." when listening but no update yet', async () => {
      mockStateBridge.isListening = true;
      mockStateBridge.lastUpdateTime = null;

      const user = userEvent.setup();
      renderWithCode();

      // Enter edit mode
      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        expect(screen.getByText(/waiting for state/i)).toBeInTheDocument();
      });
    });

    it('should show "State capture paused" when not actively listening', async () => {
      mockStateBridge.isListening = false;
      mockStateBridge.lastError = null;

      const user = userEvent.setup();
      renderWithCode();

      // Enter edit mode
      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        expect(screen.getByText(/state capture paused/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Story 8.2: State Persistence Integration Tests
  // ===========================================================================

  describe('State Persistence (Story 8.2)', () => {
    function renderWithCodeForPersistence() {
      vi.mocked(usePrototype).mockReturnValue({
        data: { ...mockPrototype, code: '{"App.tsx":"console.log()"}' },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useVersionHistory).mockReturnValue({
        data: [{ ...mockPrototype, code: '{"App.tsx":"console.log()"}' }],
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      return render(<PrototypeViewerPage />);
    }

    beforeEach(() => {
      // Reset state persistence mock
      mockStatePersistence.saveStatus = 'idle';
      mockStatePersistence.lastSavedAt = null;
      mockStatePersistence.lastError = null;
      mockStatePersistence.saveNow = vi.fn();

      // Ensure edit mode mocks
      mockStateBridge.isListening = true;
      mockStateBridge.lastError = null;
      mockStateBridge.lastUpdateTime = Date.now();
    });

    it('renders StatePersistenceIndicator in edit mode', async () => {
      const user = userEvent.setup();
      renderWithCodeForPersistence();

      // Enter edit mode
      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('state-persistence-indicator')).toBeInTheDocument();
      });
    });

    it('does NOT render StatePersistenceIndicator in view mode', () => {
      renderWithCodeForPersistence();

      expect(screen.queryByTestId('state-persistence-indicator')).not.toBeInTheDocument();
    });

    it('shows "Saving..." when state is being saved', async () => {
      mockStatePersistence.saveStatus = 'saving';

      const user = userEvent.setup();
      renderWithCodeForPersistence();

      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        const indicator = screen.getByTestId('state-persistence-indicator');
        expect(indicator).toHaveAttribute('data-status', 'saving');
        expect(indicator).toHaveTextContent('Saving...');
      });
    });

    it('shows "State saved" after successful save', async () => {
      mockStatePersistence.saveStatus = 'saved';
      mockStatePersistence.lastSavedAt = new Date();

      const user = userEvent.setup();
      renderWithCodeForPersistence();

      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        const indicator = screen.getByTestId('state-persistence-indicator');
        expect(indicator).toHaveAttribute('data-status', 'saved');
        expect(indicator).toHaveTextContent('State saved');
      });
    });

    it('shows "State save failed" on error', async () => {
      mockStatePersistence.saveStatus = 'error';
      mockStatePersistence.lastError = new Error('Save failed');

      const user = userEvent.setup();
      renderWithCodeForPersistence();

      await user.click(screen.getByTestId('edit-code-btn'));

      await waitFor(() => {
        const indicator = screen.getByTestId('state-persistence-indicator');
        expect(indicator).toHaveAttribute('data-status', 'error');
        expect(indicator).toHaveTextContent('State save failed');
      });
    });
  });
});
