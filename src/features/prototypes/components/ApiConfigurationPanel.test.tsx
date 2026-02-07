// src/features/prototypes/components/ApiConfigurationPanel.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiConfigurationPanel } from './ApiConfigurationPanel';
import { apiConfigService } from '../services/apiConfigService';

// Mock the service
vi.mock('../services/apiConfigService', () => ({
  apiConfigService: {
    getApiConfigs: vi.fn(),
    createApiConfig: vi.fn(),
    updateApiConfig: vi.fn(),
    deleteApiConfig: vi.fn(),
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockService = vi.mocked(apiConfigService);

const sampleConfigs = [
  {
    id: 'cfg-1',
    prototypeId: 'proto-1',
    name: 'getUsers',
    url: 'https://api.example.com/users',
    method: 'GET' as const,
    headers: {},
    isMock: false,
    mockResponse: null,
    mockStatusCode: 200,
    mockDelayMs: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('ApiConfigurationPanel', () => {
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

  const renderPanel = (prototypeId = 'proto-1') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ApiConfigurationPanel prototypeId={prototypeId} />
      </QueryClientProvider>,
    );
  };

  it('should show loading state initially', () => {
    mockService.getApiConfigs.mockImplementation(() => new Promise(() => {}));

    renderPanel();

    expect(screen.getByTestId('api-config-loading')).toBeInTheDocument();
  });

  it('should show error state on fetch failure', async () => {
    mockService.getApiConfigs.mockResolvedValue({
      data: null,
      error: { message: 'Network error', code: 'DB_ERROR' },
    });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('api-config-error')).toBeInTheDocument();
    });
  });

  it('should render empty state when no configs exist', async () => {
    mockService.getApiConfigs.mockResolvedValue({ data: [], error: null });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('api-endpoint-list-empty')).toBeInTheDocument();
    });
  });

  it('should render endpoint list when configs exist', async () => {
    mockService.getApiConfigs.mockResolvedValue({ data: sampleConfigs, error: null });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('getUsers')).toBeInTheDocument();
    });

    expect(screen.getByText('API Endpoints')).toBeInTheDocument();
    expect(screen.getByTestId('add-endpoint-btn')).toBeInTheDocument();
  });

  it('should show count badge with number of configs', async () => {
    mockService.getApiConfigs.mockResolvedValue({ data: sampleConfigs, error: null });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('should switch to create form when Add Endpoint is clicked', async () => {
    mockService.getApiConfigs.mockResolvedValue({ data: [], error: null });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('add-endpoint-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('add-endpoint-btn'));

    expect(screen.getByTestId('api-endpoint-form')).toBeInTheDocument();
    expect(screen.getByTestId('save-endpoint-btn')).toHaveTextContent('Add Endpoint');
  });

  it('should switch to edit form when Edit is clicked on an endpoint', async () => {
    mockService.getApiConfigs.mockResolvedValue({ data: sampleConfigs, error: null });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('edit-endpoint-getUsers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-endpoint-getUsers'));

    expect(screen.getByTestId('api-endpoint-form')).toBeInTheDocument();
    expect(screen.getByText('Edit Endpoint')).toBeInTheDocument();
    expect(screen.getByTestId('endpoint-name-input')).toHaveValue('getUsers');
  });

  it('should show confirm dialog when Delete is clicked', async () => {
    mockService.getApiConfigs.mockResolvedValue({ data: sampleConfigs, error: null });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('delete-endpoint-getUsers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-endpoint-getUsers'));

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('Delete endpoint "getUsers"'),
    );

    confirmSpy.mockRestore();
  });

  it('should return to list view when cancel is clicked on form', async () => {
    mockService.getApiConfigs.mockResolvedValue({ data: [], error: null });

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('add-endpoint-btn')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('add-endpoint-btn'));
    expect(screen.getByTestId('api-endpoint-form')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cancel-endpoint-form'));

    await waitFor(() => {
      expect(screen.queryByTestId('api-endpoint-form')).not.toBeInTheDocument();
    });
  });
});
