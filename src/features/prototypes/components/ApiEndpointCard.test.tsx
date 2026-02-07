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
});
