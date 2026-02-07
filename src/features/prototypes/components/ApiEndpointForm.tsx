// src/features/prototypes/components/ApiEndpointForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X } from 'lucide-react';
import { apiConfigSchema, type ApiConfigFormValues } from '../schemas/apiConfigSchemas';
import type { ApiConfig, HttpMethod } from '../types';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export interface ApiEndpointFormProps {
  /** Existing config for edit mode; null for create mode */
  initialValues?: ApiConfig | null;
  onSubmit: (values: ApiConfigFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/** Convert headers Record to array for field array management */
function headersToArray(headers: Record<string, string>): { key: string; value: string }[] {
  const entries = Object.entries(headers);
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [];
}

/** Convert field array back to Record */
function arrayToHeaders(arr: { key: string; value: string }[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { key, value } of arr) {
    if (key.trim()) {
      result[key.trim()] = value;
    }
  }
  return result;
}

/**
 * Form for adding or editing an API endpoint configuration.
 * Uses react-hook-form + Zod validation.
 */
export function ApiEndpointForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ApiEndpointFormProps) {
  const isEditing = !!initialValues;

  // Local header state managed separately for dynamic key-value pairs
  const [headerEntries, setHeaderEntries] = useState<{ key: string; value: string }[]>(
    initialValues?.headers ? headersToArray(initialValues.headers) : [],
  );

  // Mock response as JSON string for textarea editing
  const [mockResponseStr, setMockResponseStr] = useState<string>(
    initialValues?.mockResponse != null ? JSON.stringify(initialValues.mockResponse, null, 2) : '',
  );
  const [mockResponseError, setMockResponseError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApiConfigFormValues>({
    resolver: zodResolver(apiConfigSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      url: initialValues?.url ?? '',
      method: (initialValues?.method as ApiConfigFormValues['method']) ?? 'GET',
      headers: initialValues?.headers ?? {},
      isMock: initialValues?.isMock ?? false,
      mockStatusCode: initialValues?.mockStatusCode ?? 200,
      mockDelayMs: initialValues?.mockDelayMs ?? 0,
    },
  });

  const isMock = watch('isMock');

  const handleFormSubmit = handleSubmit((data) => {
    // Merge headers from local state
    data.headers = arrayToHeaders(headerEntries);

    // Parse mock response JSON
    if (data.isMock && mockResponseStr.trim()) {
      try {
        data.mockResponse = JSON.parse(mockResponseStr);
        setMockResponseError(null);
      } catch {
        setMockResponseError('Invalid JSON format');
        return;
      }
    } else {
      data.mockResponse = undefined;
    }

    onSubmit(data);
  });

  // Header management
  const addHeaderEntry = () => {
    setHeaderEntries((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeHeaderEntry = (index: number) => {
    setHeaderEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateHeaderEntry = (index: number, field: 'key' | 'value', val: string) => {
    setHeaderEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: val } : entry)),
    );
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" data-testid="api-endpoint-form">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">
          {isEditing ? 'Edit Endpoint' : 'Add Endpoint'}
        </h3>
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square"
          onClick={onCancel}
          aria-label="Cancel"
          data-testid="cancel-endpoint-form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Name */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs">Endpoint Name</span>
        </label>
        <input
          type="text"
          className={`input input-sm input-bordered w-full ${errors.name ? 'input-error' : ''}`}
          placeholder="e.g., getUsers"
          {...register('name')}
          data-testid="endpoint-name-input"
        />
        {errors.name && (
          <label className="label py-0">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </label>
        )}
      </div>

      {/* URL */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs">URL</span>
        </label>
        <input
          type="text"
          className={`input input-sm input-bordered w-full ${errors.url ? 'input-error' : ''}`}
          placeholder="https://api.example.com/users"
          {...register('url')}
          data-testid="endpoint-url-input"
        />
        {errors.url && (
          <label className="label py-0">
            <span className="label-text-alt text-error">{errors.url.message}</span>
          </label>
        )}
      </div>

      {/* Method */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs">HTTP Method</span>
        </label>
        <select
          className={`select select-sm select-bordered w-full ${errors.method ? 'select-error' : ''}`}
          {...register('method')}
          data-testid="endpoint-method-select"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Headers (dynamic key-value pairs) */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs">Headers</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs gap-1"
            onClick={addHeaderEntry}
            data-testid="add-header-btn"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </label>
        {headerEntries.length > 0 && (
          <div className="space-y-1">
            {headerEntries.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <input
                  type="text"
                  className="input input-xs input-bordered flex-1"
                  placeholder="Key"
                  value={entry.key}
                  onChange={(e) => updateHeaderEntry(index, 'key', e.target.value)}
                  data-testid={`header-key-${index}`}
                />
                <input
                  type="text"
                  className="input input-xs input-bordered flex-1"
                  placeholder="Value"
                  value={entry.value}
                  onChange={(e) => updateHeaderEntry(index, 'value', e.target.value)}
                  data-testid={`header-value-${index}`}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square text-error"
                  onClick={() => removeHeaderEntry(index)}
                  aria-label={`Remove header ${index}`}
                  data-testid={`remove-header-${index}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mock Mode Toggle */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3 py-1">
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-warning"
            {...register('isMock')}
            data-testid="endpoint-mock-toggle"
          />
          <span className="label-text text-xs">Mock Mode</span>
        </label>
      </div>

      {/* Mock configuration (visible when isMock is true) */}
      {isMock && (
        <div className="space-y-3 pl-2 border-l-2 border-warning/30">
          {/* Mock Status Code */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Mock Status Code</span>
            </label>
            <input
              type="number"
              className={`input input-sm input-bordered w-24 ${errors.mockStatusCode ? 'input-error' : ''}`}
              {...register('mockStatusCode', { valueAsNumber: true })}
              data-testid="endpoint-mock-status-input"
            />
            {errors.mockStatusCode && (
              <label className="label py-0">
                <span className="label-text-alt text-error">{errors.mockStatusCode.message}</span>
              </label>
            )}
          </div>

          {/* Mock Delay */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Mock Delay (ms)</span>
            </label>
            <input
              type="number"
              className={`input input-sm input-bordered w-24 ${errors.mockDelayMs ? 'input-error' : ''}`}
              {...register('mockDelayMs', { valueAsNumber: true })}
              data-testid="endpoint-mock-delay-input"
            />
            {errors.mockDelayMs && (
              <label className="label py-0">
                <span className="label-text-alt text-error">{errors.mockDelayMs.message}</span>
              </label>
            )}
          </div>

          {/* Mock Response JSON */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Mock Response (JSON)</span>
            </label>
            <textarea
              className={`textarea textarea-sm textarea-bordered w-full font-mono text-xs ${mockResponseError ? 'textarea-error' : ''}`}
              rows={4}
              placeholder='{"key": "value"}'
              value={mockResponseStr}
              onChange={(e) => {
                setMockResponseStr(e.target.value);
                setMockResponseError(null);
              }}
              data-testid="endpoint-mock-response-textarea"
            />
            {mockResponseError && (
              <label className="label py-0">
                <span className="label-text-alt text-error">{mockResponseError}</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-primary"
          disabled={isSubmitting}
          data-testid="save-endpoint-btn"
        >
          {isSubmitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : isEditing ? (
            'Update'
          ) : (
            'Add Endpoint'
          )}
        </button>
      </div>
    </form>
  );
}
