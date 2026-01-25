import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GeneratePrototypeButton } from './GeneratePrototypeButton';
import { useGeneratePrototype } from '../hooks/useGeneratePrototype';

// Mock the hook
vi.mock('../hooks/useGeneratePrototype');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('GeneratePrototypeButton', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (props: {
    prdId: string;
    ideaId: string;
    existingPrototypeId?: string;
  }) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GeneratePrototypeButton {...props} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('when no prototype exists', () => {
    beforeEach(() => {
      vi.mocked(useGeneratePrototype).mockReturnValue({
        generate: vi.fn(),
        retry: vi.fn(),
        isGenerating: false,
        progress: { stage: 'analyzing', percent: 0 },
        error: null,
        startTime: 0,
      });
    });

    it('should render generate button', () => {
      renderComponent({ prdId: 'prd-1', ideaId: 'idea-1' });
      expect(screen.getByText('Generate Prototype')).toBeInTheDocument();
    });

    it('should call generate when button is clicked', async () => {
      const mockGenerate = vi.fn();
      vi.mocked(useGeneratePrototype).mockReturnValue({
        generate: mockGenerate,
        retry: vi.fn(),
        isGenerating: false,
        progress: { stage: 'analyzing', percent: 0 },
        error: null,
        startTime: 0,
      });

      renderComponent({ prdId: 'prd-1', ideaId: 'idea-1' });
      const button = screen.getByText('Generate Prototype');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGenerate).toHaveBeenCalledWith('prd-1', 'idea-1');
      });
    });

    it('should disable button when generating', () => {
      vi.mocked(useGeneratePrototype).mockReturnValue({
        generate: vi.fn(),
        retry: vi.fn(),
        isGenerating: true,
        progress: { stage: 'generating', percent: 50 },
        error: null,
        startTime: Date.now(),
      });

      renderComponent({ prdId: 'prd-1', ideaId: 'idea-1' });
      const button = screen.getByText('Generating Prototype...');
      expect(button).toBeDisabled();
    });

    it('should show error message with retry button on failure', () => {
      const mockRetry = vi.fn();
      vi.mocked(useGeneratePrototype).mockReturnValue({
        generate: vi.fn(),
        retry: mockRetry,
        isGenerating: false,
        progress: { stage: 'analyzing', percent: 0 },
        error: new Error('Generation failed'),
        startTime: 0,
      });

      renderComponent({ prdId: 'prd-1', ideaId: 'idea-1' });
      expect(screen.getByText('Generation failed')).toBeInTheDocument();
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('when prototype already exists', () => {
    beforeEach(() => {
      vi.mocked(useGeneratePrototype).mockReturnValue({
        generate: vi.fn(),
        retry: vi.fn(),
        isGenerating: false,
        progress: { stage: 'analyzing', percent: 0 },
        error: null,
        startTime: 0,
      });
    });

    it('should show "View Prototype" button', () => {
      renderComponent({
        prdId: 'prd-1',
        ideaId: 'idea-1',
        existingPrototypeId: 'proto-1',
      });
      expect(screen.getByText('View Prototype')).toBeInTheDocument();
    });

    it('should navigate to prototype viewer when clicked', () => {
      renderComponent({
        prdId: 'prd-1',
        ideaId: 'idea-1',
        existingPrototypeId: 'proto-1',
      });
      const viewButton = screen.getByText('View Prototype');
      fireEvent.click(viewButton);
      expect(mockNavigate).toHaveBeenCalledWith('/prototypes/proto-1');
    });

    it('should show regenerate option', () => {
      renderComponent({
        prdId: 'prd-1',
        ideaId: 'idea-1',
        existingPrototypeId: 'proto-1',
      });
      expect(screen.getByText('Regenerate')).toBeInTheDocument();
    });

    it('should switch to generate mode when regenerate is clicked', () => {
      renderComponent({
        prdId: 'prd-1',
        ideaId: 'idea-1',
        existingPrototypeId: 'proto-1',
      });
      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);
      expect(screen.getByText('Generate Prototype')).toBeInTheDocument();
      expect(screen.queryByText('View Prototype')).not.toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onGenerationStart when generation begins', async () => {
      const mockGenerate = vi.fn();
      vi.mocked(useGeneratePrototype).mockReturnValue({
        generate: mockGenerate,
        retry: vi.fn(),
        isGenerating: false,
        progress: { stage: 'analyzing', percent: 0 },
        error: null,
        startTime: 0,
      });

      const onGenerationStart = vi.fn();
      render(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <GeneratePrototypeButton
              prdId="prd-1"
              ideaId="idea-1"
              onGenerationStart={onGenerationStart}
            />
          </BrowserRouter>
        </QueryClientProvider>
      );

      const button = screen.getByText('Generate Prototype');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onGenerationStart).toHaveBeenCalled();
      });
    });
  });
});
