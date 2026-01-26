import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { PrototypeViewerPage } from './PrototypeViewerPage';
import { usePrototype } from '../features/prototypes/hooks/usePrototype';
import type { Prototype } from '../features/prototypes/types';

// Mock the usePrototype hook
vi.mock('../features/prototypes/hooks/usePrototype');

// Mock useParams and useNavigate
const mockNavigate = vi.fn();
const mockParams = { prototypeId: 'proto-1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
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
};

describe('PrototypeViewerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
