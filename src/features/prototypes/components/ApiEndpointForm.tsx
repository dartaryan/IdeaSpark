// src/features/prototypes/components/ApiEndpointForm.tsx

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X, Braces, Bot } from 'lucide-react';
import { apiConfigSchema, type ApiConfigFormValues } from '../schemas/apiConfigSchemas';
import type { ApiConfig, HttpMethod } from '../types';
import { MockResponseEditor } from './MockResponseEditor';
import { MockTemplateSelector } from './MockTemplateSelector';
import { MockResponsePreview } from './MockResponsePreview';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const AI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];

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
    setValue,
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
      isAi: initialValues?.isAi ?? false,
      aiModel: initialValues?.aiModel ?? 'gemini-2.5-flash',
      aiSystemPrompt: initialValues?.aiSystemPrompt ?? '',
      aiMaxTokens: initialValues?.aiMaxTokens ?? 1024,
      aiTemperature: initialValues?.aiTemperature ?? 0.7,
    },
  });

  const isMock = watch('isMock');
  const isAi = watch('isAi');
  const aiTemperature = watch('aiTemperature');
  const aiSystemPrompt = watch('aiSystemPrompt') ?? '';

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

    // Clear AI fields when AI mode is off
    if (!data.isAi) {
      data.aiSystemPrompt = undefined;
      data.aiModel = 'gemini-2.5-flash';
      data.aiMaxTokens = 1024;
      data.aiTemperature = 0.7;
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

  // Mock editor handlers
  const handleEditorChange = useCallback((value: string) => {
    setMockResponseStr(value);
  }, []);

  const handleFormatJson = useCallback(() => {
    if (!mockResponseStr.trim()) return;
    try {
      const parsed = JSON.parse(mockResponseStr);
      const formatted = JSON.stringify(parsed, null, 2);
      setMockResponseStr(formatted);
      setMockResponseError(null);
    } catch {
      // Cannot format invalid JSON — error is already shown by linter
    }
  }, [mockResponseStr]);

  const handleTemplateSelect = useCallback((content: string) => {
    setMockResponseStr(content);
    setMockResponseError(null);
  }, []);

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
          placeholder={isAi ? 'e.g., generateDescription' : 'e.g., getUsers'}
          {...register('name')}
          data-testid="endpoint-name-input"
        />
        {errors.name && (
          <label className="label py-0">
            <span className="label-text-alt text-error">{errors.name.message}</span>
          </label>
        )}
      </div>

      {/* AI Mode Toggle */}
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3 py-1">
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-info"
            {...register('isAi')}
            data-testid="endpoint-ai-toggle"
          />
          <span className="label-text text-xs flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" />
            AI Mode
          </span>
        </label>
      </div>

      {/* AI Configuration (visible when isAi is true) */}
      {isAi && (
        <div className="space-y-3 pl-2 border-l-2 border-info/30" data-testid="ai-config-section">
          {/* AI Model */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Model</span>
            </label>
            <select
              className="select select-sm select-bordered w-full"
              {...register('aiModel')}
              data-testid="ai-model-select"
            >
              {AI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">
                System Prompt <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              className={`textarea textarea-sm textarea-bordered w-full min-h-[120px] ${errors.aiSystemPrompt ? 'textarea-error' : ''}`}
              placeholder="You are a helpful assistant that generates product descriptions..."
              {...register('aiSystemPrompt')}
              data-testid="ai-system-prompt-input"
            />
            <label className="label py-0">
              <span className={`label-text-alt ${errors.aiSystemPrompt ? 'text-error' : ''}`}>
                {errors.aiSystemPrompt?.message || `${aiSystemPrompt.length}/10000 characters`}
              </span>
            </label>
          </div>

          {/* Max Tokens */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Max Tokens</span>
            </label>
            <input
              type="number"
              className={`input input-sm input-bordered w-32 ${errors.aiMaxTokens ? 'input-error' : ''}`}
              {...register('aiMaxTokens', { valueAsNumber: true })}
              data-testid="ai-max-tokens-input"
            />
            {errors.aiMaxTokens && (
              <label className="label py-0">
                <span className="label-text-alt text-error">{errors.aiMaxTokens.message}</span>
              </label>
            )}
          </div>

          {/* Temperature */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Temperature: {aiTemperature}</span>
            </label>
            <input
              type="range"
              className="range range-xs range-info"
              min={0}
              max={2}
              step={0.1}
              {...register('aiTemperature', { valueAsNumber: true })}
              data-testid="ai-temperature-input"
            />
            <div className="flex justify-between text-xs text-base-content/50 px-1">
              <span>0</span>
              <span>1</span>
              <span>2</span>
            </div>
          </div>
        </div>
      )}

      {/* Standard endpoint fields (hidden when AI mode is on) */}
      {!isAi && (
        <>
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
        </>
      )}

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

          {/* Mock Response JSON Editor */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Mock Response (JSON)</span>
            </label>

            {/* Toolbar: Format JSON + Template Selector */}
            <div
              className="flex items-center gap-1 px-2 py-1 bg-base-300 border border-base-content/20 border-b-0 rounded-t-lg"
              data-testid="mock-editor-toolbar"
            >
              <button
                type="button"
                className="btn btn-ghost btn-xs gap-1"
                onClick={handleFormatJson}
                data-testid="format-json-btn"
              >
                <Braces className="w-3 h-3" />
                Format
              </button>
              <MockTemplateSelector
                onSelect={handleTemplateSelect}
                hasContent={!!mockResponseStr.trim()}
              />
            </div>

            {/* CodeMirror JSON Editor */}
            <MockResponseEditor
              value={mockResponseStr}
              onChange={handleEditorChange}
              onError={setMockResponseError}
              disabled={isSubmitting}
            />

            {mockResponseError && (
              <label className="label py-0">
                <span className="label-text-alt text-error" data-testid="mock-response-error">
                  {mockResponseError}
                </span>
              </label>
            )}

            {/* Mock Response Preview */}
            <div className="mt-2">
              <MockResponsePreview
                responseBody={mockResponseStr}
                statusCode={watch('mockStatusCode') || 200}
                delayMs={watch('mockDelayMs') || 0}
                hasError={!!mockResponseError}
              />
            </div>
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
