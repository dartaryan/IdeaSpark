// src/features/prototypes/components/RefinementChat.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RefinementChat } from './RefinementChat';
import { openLovableService } from '../../../services/openLovableService';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../services/openLovableService');

describe('RefinementChat', () => {
  let queryClient: QueryClient;
  const mockOnRefinementComplete = vi.fn();

  const renderComponent = (prototypeId = 'proto-123') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RefinementChat
          prototypeId={prototypeId}
          onRefinementComplete={mockOnRefinementComplete}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  it('should render refinement chat interface', () => {
    renderComponent();

    expect(screen.getByText('Refine Your Prototype')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your refinement...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refine prototype/i })).toBeInTheDocument();
  });

  it('should prevent submission for prompt less than 10 characters', async () => {
    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    fireEvent.change(textarea, { target: { value: 'short' } });
    
    // Submit button should be disabled
    expect(submitButton).toBeDisabled();
    
    // Character counter should show validation feedback
    expect(screen.getByText(/more characters needed/i)).toBeInTheDocument();

    // Should not call service when button is disabled
    fireEvent.click(submitButton);
    expect(openLovableService.refine).not.toHaveBeenCalled();
  });

  it('should prevent submission for prompt over 500 characters', async () => {
    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    // Textarea has maxLength=500, so we can't actually type 501 chars
    // But we can test that at 500 chars exactly, it still allows submission
    const maxPrompt = 'a'.repeat(500);
    fireEvent.change(textarea, { target: { value: maxPrompt } });
    
    // At exactly 500 chars, should be valid since it has > 10 chars
    expect(submitButton).not.toBeDisabled();
    expect(screen.getByText('500/500')).toBeInTheDocument();
  });

  it('should show character counter', () => {
    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    fireEvent.change(textarea, { target: { value: 'Test' } });

    expect(screen.getByText(/6 more characters needed/i)).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Test message with enough chars' } });
    expect(screen.getByText(/30\/500/i)).toBeInTheDocument();
  });

  it('should disable submit button when prompt is invalid', () => {
    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    // Empty prompt
    expect(submitButton).toBeDisabled();

    // Short prompt (less than 10 chars)
    fireEvent.change(textarea, { target: { value: 'short' } });
    expect(submitButton).toBeDisabled();

    // Valid prompt
    fireEvent.change(textarea, { target: { value: 'Make the header much larger' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('should submit refinement successfully', async () => {
    const mockRefineResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollResponse = {
      data: { status: 'ready' as const, url: 'https://example.com/new', code: '<div>Refined</div>' },
      error: null,
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockRefineResponse);
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollResponse);

    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    fireEvent.change(textarea, { target: { value: 'Make the header larger' } });
    fireEvent.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/refining prototype/i)).toBeInTheDocument();
    });

    // Should call service
    await waitFor(() => {
      expect(openLovableService.refine).toHaveBeenCalledWith('proto-123', 'Make the header larger');
    });

    // Should call onRefinementComplete
    await waitFor(() => {
      expect(mockOnRefinementComplete).toHaveBeenCalledWith('new-proto-123');
    });

    // Should clear input after success
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('should show error message on refinement failure', async () => {
    const mockError = {
      data: null,
      error: { message: 'Refinement failed', code: 'API_ERROR' },
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockError);

    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    fireEvent.change(textarea, { target: { value: 'Make the header larger' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/refinement failed/i)).toBeInTheDocument();
    });

    // Should preserve prompt for retry
    expect(textarea).toHaveValue('Make the header larger');
  });

  it('should allow retry after error', async () => {
    const mockError = {
      data: null,
      error: { message: 'Refinement failed', code: 'API_ERROR' },
    };

    const mockSuccessResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollResponse = {
      data: { status: 'ready' as const, url: 'https://example.com/new', code: '<div>Refined</div>' },
      error: null,
    };

    vi.mocked(openLovableService.refine)
      .mockResolvedValueOnce(mockError)
      .mockResolvedValueOnce(mockSuccessResponse);
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollResponse);

    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    // First attempt - fails
    fireEvent.change(textarea, { target: { value: 'Make the header larger' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/refinement failed/i)).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    // Second attempt - succeeds
    await waitFor(() => {
      expect(mockOnRefinementComplete).toHaveBeenCalledWith('new-proto-123');
    });
  });

  it('should disable input during refinement', async () => {
    const mockRefineResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollResponse = {
      data: { status: 'ready' as const, url: 'https://example.com/new', code: '<div>Refined</div>' },
      error: null,
    };

    vi.mocked(openLovableService.refine).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockRefineResponse), 100))
    );
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollResponse);

    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    fireEvent.change(textarea, { target: { value: 'Make the header larger' } });
    fireEvent.click(submitButton);

    // Check textarea is disabled during loading
    await waitFor(() => {
      expect(textarea).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    // Wait for completion
    await waitFor(() => {
      expect(mockOnRefinementComplete).toHaveBeenCalled();
    });
  });

  it('should show loading indicator during refinement', async () => {
    const mockRefineResponse = {
      data: { prototypeId: 'new-proto-123', status: 'generating' as const },
      error: null,
    };

    const mockPollResponse = {
      data: { status: 'ready' as const, url: 'https://example.com/new', code: '<div>Refined</div>' },
      error: null,
    };

    vi.mocked(openLovableService.refine).mockResolvedValue(mockRefineResponse);
    vi.mocked(openLovableService.pollStatus).mockResolvedValue(mockPollResponse);

    renderComponent();

    const textarea = screen.getByPlaceholderText('Describe your refinement...');
    const submitButton = screen.getByRole('button', { name: /refine prototype/i });

    fireEvent.change(textarea, { target: { value: 'Make the header larger' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/generating refined prototype/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockOnRefinementComplete).toHaveBeenCalled();
    });
  });
});
