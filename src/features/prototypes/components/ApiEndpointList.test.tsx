// src/features/prototypes/components/ApiEndpointList.test.tsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ApiEndpointList } from './ApiEndpointList';
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

describe('ApiEndpointList', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  it('should render empty state when no configs', () => {
    render(<ApiEndpointList configs={[]} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByTestId('api-endpoint-list-empty')).toBeInTheDocument();
    expect(screen.getByText(/no api endpoints configured/i)).toBeInTheDocument();
  });

  it('should render list of endpoint cards', () => {
    const configs = [
      makeConfig({ id: 'cfg-1', name: 'getUsers' }),
      makeConfig({ id: 'cfg-2', name: 'createUser', method: 'POST' }),
    ];

    render(<ApiEndpointList configs={configs} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByTestId('api-endpoint-list')).toBeInTheDocument();
    expect(screen.getByText('getUsers')).toBeInTheDocument();
    expect(screen.getByText('createUser')).toBeInTheDocument();
  });

  it('should render guidance text in empty state', () => {
    render(<ApiEndpointList configs={[]} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText(/configure api endpoints to make real or mock api calls/i)).toBeInTheDocument();
  });
});
