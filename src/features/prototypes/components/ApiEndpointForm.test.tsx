// src/features/prototypes/components/ApiEndpointForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiEndpointForm } from './ApiEndpointForm';
import type { ApiConfig } from '../types';

// Track the latest onChange/onError callbacks from MockResponseEditor
let mockEditorOnChange: ((value: string) => void) | undefined;
let mockEditorOnError: ((error: string | null) => void) | undefined;
let mockEditorValue = '';

// Mock MockResponseEditor - replaces CodeMirror with a simple textarea
vi.mock('./MockResponseEditor', () => ({
  MockResponseEditor: ({
    value,
    onChange,
    onError,
  }: {
    value: string;
    onChange: (value: string) => void;
    onError: (error: string | null) => void;
    disabled?: boolean;
  }) => {
    mockEditorOnChange = onChange;
    mockEditorOnError = onError;
    mockEditorValue = value;
    return (
      <div data-testid="mock-response-editor">
        <textarea
          data-testid="mock-editor-textarea"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      </div>
    );
  },
}));

// Mock MockTemplateSelector
vi.mock('./MockTemplateSelector', () => ({
  MockTemplateSelector: ({
    onSelect,
    hasContent,
  }: {
    onSelect: (content: string) => void;
    hasContent: boolean;
  }) => (
    <div data-testid="mock-template-selector" data-has-content={hasContent}>
      <button
        type="button"
        data-testid="mock-template-trigger"
        onClick={() => onSelect('{"template": true}')}
      >
        Templates
      </button>
    </div>
  ),
}));

// Mock MockResponsePreview
vi.mock('./MockResponsePreview', () => ({
  MockResponsePreview: ({
    responseBody,
    statusCode,
    delayMs,
    hasError,
  }: {
    responseBody: string;
    statusCode: number;
    delayMs: number;
    hasError: boolean;
  }) => (
    <div
      data-testid="mock-response-preview"
      data-status={statusCode}
      data-delay={delayMs}
      data-has-error={hasError}
      data-body={responseBody}
    />
  ),
}));

const makeConfig = (overrides: Partial<ApiConfig> = {}): ApiConfig => ({
  id: 'cfg-1',
  prototypeId: 'proto-1',
  name: 'getUsers',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: { Authorization: 'Bearer token' },
  isMock: false,
  mockResponse: null,
  mockStatusCode: 200,
  mockDelayMs: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('ApiEndpointForm', () => {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorOnChange = undefined;
    mockEditorOnError = undefined;
    mockEditorValue = '';
  });

  it('should render the form with empty fields for create mode', () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByTestId('api-endpoint-form')).toBeInTheDocument();
    expect(screen.getByTestId('save-endpoint-btn')).toHaveTextContent('Add Endpoint');
    expect(screen.getByTestId('endpoint-name-input')).toHaveValue('');
    expect(screen.getByTestId('endpoint-url-input')).toHaveValue('');
    expect(screen.getByTestId('endpoint-method-select')).toHaveValue('GET');
  });

  it('should render the form pre-populated for edit mode', () => {
    render(
      <ApiEndpointForm
        initialValues={makeConfig()}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Edit Endpoint')).toBeInTheDocument();
    expect(screen.getByTestId('endpoint-name-input')).toHaveValue('getUsers');
    expect(screen.getByTestId('endpoint-url-input')).toHaveValue('https://api.example.com/users');
    expect(screen.getByTestId('endpoint-method-select')).toHaveValue('GET');
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('cancel-endpoint-form'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show validation error for empty name', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Fill URL but leave name empty
    fireEvent.change(screen.getByTestId('endpoint-url-input'), {
      target: { value: 'https://api.test.com' },
    });

    fireEvent.click(screen.getByTestId('save-endpoint-btn'));

    await waitFor(() => {
      expect(screen.getByText(/endpoint name is required/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid URL', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByTestId('endpoint-name-input'), {
      target: { value: 'testEndpoint' },
    });
    fireEvent.change(screen.getByTestId('endpoint-url-input'), {
      target: { value: 'not-a-url' },
    });

    fireEvent.click(screen.getByTestId('save-endpoint-btn'));

    await waitFor(() => {
      expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
    });
  });

  it('should submit valid data', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByTestId('endpoint-name-input'), {
      target: { value: 'testEndpoint' },
    });
    fireEvent.change(screen.getByTestId('endpoint-url-input'), {
      target: { value: 'https://api.test.com/data' },
    });
    fireEvent.change(screen.getByTestId('endpoint-method-select'), {
      target: { value: 'POST' },
    });

    fireEvent.click(screen.getByTestId('save-endpoint-btn'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'testEndpoint',
          url: 'https://api.test.com/data',
          method: 'POST',
        }),
      );
    });
  });

  it('should show mock configuration when mock toggle is enabled', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Mock fields should not be visible initially
    expect(screen.queryByTestId('endpoint-mock-status-input')).not.toBeInTheDocument();

    // Toggle mock mode
    fireEvent.click(screen.getByTestId('endpoint-mock-toggle'));

    // Mock fields should now be visible with new components
    await waitFor(() => {
      expect(screen.getByTestId('endpoint-mock-status-input')).toBeInTheDocument();
      expect(screen.getByTestId('endpoint-mock-delay-input')).toBeInTheDocument();
      expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
      expect(screen.getByTestId('mock-editor-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('mock-template-selector')).toBeInTheDocument();
      expect(screen.getByTestId('mock-response-preview')).toBeInTheDocument();
    });
  });

  it('should show CodeMirror editor instead of textarea in mock mode', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('endpoint-mock-toggle'));

    await waitFor(() => {
      // New editor should be present
      expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
      // Old textarea should not be present
      expect(screen.queryByTestId('endpoint-mock-response-textarea')).not.toBeInTheDocument();
    });
  });

  it('should show Format JSON button in the toolbar', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('endpoint-mock-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('format-json-btn')).toBeInTheDocument();
      expect(screen.getByText('Format')).toBeInTheDocument();
    });
  });

  it('should add and remove header entries', () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Add a header
    fireEvent.click(screen.getByTestId('add-header-btn'));

    expect(screen.getByTestId('header-key-0')).toBeInTheDocument();
    expect(screen.getByTestId('header-value-0')).toBeInTheDocument();

    // Remove the header
    fireEvent.click(screen.getByTestId('remove-header-0'));

    expect(screen.queryByTestId('header-key-0')).not.toBeInTheDocument();
  });

  it('should show "Update" button text in edit mode', () => {
    render(
      <ApiEndpointForm initialValues={makeConfig()} onSubmit={onSubmit} onCancel={onCancel} />,
    );

    expect(screen.getByTestId('save-endpoint-btn')).toHaveTextContent('Update');
  });

  it('should show "Add Endpoint" button text in create mode', () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByTestId('save-endpoint-btn')).toHaveTextContent('Add Endpoint');
  });

  it('should disable submit button when isSubmitting', () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} isSubmitting />);

    expect(screen.getByTestId('save-endpoint-btn')).toBeDisabled();
  });

  it('should show mock response JSON validation error for invalid JSON', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Fill required fields
    fireEvent.change(screen.getByTestId('endpoint-name-input'), {
      target: { value: 'testEndpoint' },
    });
    fireEvent.change(screen.getByTestId('endpoint-url-input'), {
      target: { value: 'https://api.test.com' },
    });

    // Enable mock mode
    fireEvent.click(screen.getByTestId('endpoint-mock-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
    });

    // Simulate the editor reporting invalid JSON via onChange
    const editorTextarea = screen.getByTestId('mock-editor-textarea');
    fireEvent.change(editorTextarea, {
      target: { value: '{ invalid json }' },
    });

    fireEvent.click(screen.getByTestId('save-endpoint-btn'));

    await waitFor(() => {
      expect(screen.getByText(/invalid json format/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should integrate MockTemplateSelector and update editor via template selection', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('endpoint-mock-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-template-selector')).toBeInTheDocument();
    });

    // Click mock template trigger (which calls onSelect with template content)
    fireEvent.click(screen.getByTestId('mock-template-trigger'));

    // The mock template selector calls onSelect('{"template": true}')
    // which triggers handleTemplateSelect, setting mockResponseStr
    await waitFor(() => {
      const editorTextarea = screen.getByTestId('mock-editor-textarea');
      expect(editorTextarea).toHaveValue('{"template": true}');
    });
  });

  it('should pass correct props to MockResponsePreview', async () => {
    render(<ApiEndpointForm onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('endpoint-mock-toggle'));

    await waitFor(() => {
      const preview = screen.getByTestId('mock-response-preview');
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('data-status', '200');
      expect(preview).toHaveAttribute('data-delay', '0');
      expect(preview).toHaveAttribute('data-has-error', 'false');
    });
  });

  it('should pre-populate mock response editor in edit mode with mock data', async () => {
    const mockConfig = makeConfig({
      isMock: true,
      mockResponse: { id: 1, name: 'test' },
      mockStatusCode: 201,
      mockDelayMs: 500,
    });

    render(
      <ApiEndpointForm initialValues={mockConfig} onSubmit={onSubmit} onCancel={onCancel} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('mock-response-editor')).toBeInTheDocument();
      const editorTextarea = screen.getByTestId('mock-editor-textarea');
      expect(editorTextarea).toHaveValue(JSON.stringify({ id: 1, name: 'test' }, null, 2));
    });
  });
});
