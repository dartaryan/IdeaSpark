// src/features/prototypes/components/ApiEndpointCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ApiEndpointCard } from './ApiEndpointCard';
import type { ApiConfig } from '../types';

const makeConfig = (overrides: Partial<ApiConfig> = {}): ApiConfig => ({
  id: 'cfg-1',
  prototypeId: 'proto-1',
  name: 'getUsers',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: {},
  isMock: false,
  mockResponse: null,
  mockStatusCode: 200,
  mockDelayMs: 0,
  isAi: false,
  aiModel: null,
  aiSystemPrompt: null,
  aiMaxTokens: null,
  aiTemperature: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('ApiEndpointCard', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  it('should render endpoint name', () => {
    render(<ApiEndpointCard config={makeConfig()} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('getUsers')).toBeInTheDocument();
  });

  it('should render endpoint URL', () => {
    render(<ApiEndpointCard config={makeConfig()} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument();
  });

  it('should render HTTP method badge', () => {
    render(<ApiEndpointCard config={makeConfig({ method: 'POST' })} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('POST')).toBeInTheDocument();
  });

  it('should render "Live" badge when not mock', () => {
    render(<ApiEndpointCard config={makeConfig({ isMock: false })} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('should render "Mock" badge when mock mode is on', () => {
    render(<ApiEndpointCard config={makeConfig({ isMock: true })} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Mock')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const config = makeConfig();
    render(<ApiEndpointCard config={config} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByTestId('edit-endpoint-getUsers'));

    expect(onEdit).toHaveBeenCalledWith(config);
  });

  it('should call onDelete when delete button is clicked', () => {
    const config = makeConfig();
    render(<ApiEndpointCard config={config} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByTestId('delete-endpoint-getUsers'));

    expect(onDelete).toHaveBeenCalledWith(config);
  });

  it('should render correct method color for each HTTP method', () => {
    const { rerender } = render(
      <ApiEndpointCard config={makeConfig({ method: 'GET' })} onEdit={onEdit} onDelete={onDelete} />,
    );
    expect(screen.getByText('GET').className).toContain('badge-success');

    rerender(<ApiEndpointCard config={makeConfig({ method: 'DELETE' })} onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText('DELETE').className).toContain('badge-error');
  });

  // =========================================================================
  // Story 10.4: AI endpoint display tests
  // =========================================================================

  describe('AI endpoint display (Story 10.4)', () => {
    const makeAiConfig = (overrides: Partial<ApiConfig> = {}): ApiConfig =>
      makeConfig({
        name: 'generateDescription',
        isAi: true,
        aiModel: 'gemini-2.5-flash',
        aiSystemPrompt: 'You are a helpful assistant that generates product descriptions.',
        aiMaxTokens: 1024,
        aiTemperature: 0.7,
        ...overrides,
      });

    it('should render AI badge when config.isAi is true', () => {
      render(<ApiEndpointCard config={makeAiConfig()} onEdit={onEdit} onDelete={onDelete} />);

      expect(screen.getByTestId('ai-badge-generateDescription')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('should not render AI badge when config.isAi is false', () => {
      render(<ApiEndpointCard config={makeConfig()} onEdit={onEdit} onDelete={onDelete} />);

      expect(screen.queryByTestId('ai-badge-getUsers')).not.toBeInTheDocument();
    });

    it('should show model name instead of URL for AI endpoints', () => {
      render(<ApiEndpointCard config={makeAiConfig()} onEdit={onEdit} onDelete={onDelete} />);

      expect(screen.getByText('Model: gemini-2.5-flash')).toBeInTheDocument();
      expect(screen.queryByText('https://api.example.com/users')).not.toBeInTheDocument();
    });

    it('should show URL for non-AI endpoints', () => {
      render(<ApiEndpointCard config={makeConfig()} onEdit={onEdit} onDelete={onDelete} />);

      expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument();
      expect(screen.queryByText(/Model:/)).not.toBeInTheDocument();
    });

    it('should show truncated system prompt preview for AI endpoints', () => {
      render(<ApiEndpointCard config={makeAiConfig()} onEdit={onEdit} onDelete={onDelete} />);

      const preview = screen.getByTestId('ai-prompt-preview-generateDescription');
      expect(preview).toBeInTheDocument();
    });

    it('should truncate long system prompts at 80 characters', () => {
      const longPrompt = 'A'.repeat(100);
      render(
        <ApiEndpointCard
          config={makeAiConfig({ aiSystemPrompt: longPrompt })}
          onEdit={onEdit}
          onDelete={onDelete}
        />,
      );

      const preview = screen.getByTestId('ai-prompt-preview-generateDescription');
      expect(preview.textContent).toContain('...');
    });

    it('should not show system prompt preview when prompt is null', () => {
      render(
        <ApiEndpointCard
          config={makeAiConfig({ aiSystemPrompt: null })}
          onEdit={onEdit}
          onDelete={onDelete}
        />,
      );

      expect(screen.queryByTestId('ai-prompt-preview-generateDescription')).not.toBeInTheDocument();
    });

    it('should not render method badge for AI endpoints (shows AI badge instead)', () => {
      render(
        <ApiEndpointCard
          config={makeAiConfig({ method: 'POST' })}
          onEdit={onEdit}
          onDelete={onDelete}
        />,
      );

      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.queryByText('POST')).not.toBeInTheDocument();
    });

    it('should still show Mock/Live badge for AI endpoints', () => {
      render(<ApiEndpointCard config={makeAiConfig({ isMock: false })} onEdit={onEdit} onDelete={onDelete} />);
      expect(screen.getByText('Live')).toBeInTheDocument();

      const { unmount } = render(
        <ApiEndpointCard config={makeAiConfig({ isMock: true })} onEdit={onEdit} onDelete={onDelete} />,
      );
      expect(screen.getAllByText('Mock').length).toBeGreaterThanOrEqual(1);
      unmount();
    });
  });
});
