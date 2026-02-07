// src/features/prototypes/components/ApiConfigurationPanel.tsx

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';
import { useApiConfigs } from '../hooks/useApiConfigs';
import { useCreateApiConfig } from '../hooks/useCreateApiConfig';
import { useUpdateApiConfig } from '../hooks/useUpdateApiConfig';
import { useDeleteApiConfig } from '../hooks/useDeleteApiConfig';
import { ApiEndpointList } from './ApiEndpointList';
import { ApiEndpointForm } from './ApiEndpointForm';
import type { ApiConfig } from '../types';
import type { ApiConfigFormValues } from '../schemas/apiConfigSchemas';

export interface ApiConfigurationPanelProps {
  prototypeId: string;
}

type PanelView = 'list' | 'create' | 'edit';

/**
 * Main panel component for managing API endpoint configurations.
 * Displays endpoint list with add/edit/delete actions.
 */
export function ApiConfigurationPanel({ prototypeId }: ApiConfigurationPanelProps) {
  const [view, setView] = useState<PanelView>('list');
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null);

  const { data: configs, isLoading, error } = useApiConfigs(prototypeId);
  const createMutation = useCreateApiConfig();
  const updateMutation = useUpdateApiConfig();
  const deleteMutation = useDeleteApiConfig();

  const handleCreate = async (values: ApiConfigFormValues) => {
    try {
      await createMutation.mutateAsync({
        prototypeId,
        name: values.name,
        url: values.url,
        method: values.method,
        headers: values.headers,
        isMock: values.isMock,
        mockResponse: values.mockResponse,
        mockStatusCode: values.mockStatusCode,
        mockDelayMs: values.mockDelayMs,
      });
      toast.success(`Endpoint "${values.name}" added`);
      setView('list');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create endpoint');
    }
  };

  const handleUpdate = async (values: ApiConfigFormValues) => {
    if (!editingConfig) return;
    try {
      await updateMutation.mutateAsync({
        id: editingConfig.id,
        prototypeId,
        input: {
          name: values.name,
          url: values.url,
          method: values.method,
          headers: values.headers,
          isMock: values.isMock,
          mockResponse: values.mockResponse,
          mockStatusCode: values.mockStatusCode,
          mockDelayMs: values.mockDelayMs,
        },
      });
      toast.success(`Endpoint "${values.name}" updated`);
      setEditingConfig(null);
      setView('list');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update endpoint');
    }
  };

  const handleEdit = (config: ApiConfig) => {
    setEditingConfig(config);
    setView('edit');
  };

  const handleDelete = async (config: ApiConfig) => {
    const confirmed = window.confirm(
      `Delete endpoint "${config.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync({ id: config.id, prototypeId });
      toast.success(`Endpoint "${config.name}" deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete endpoint');
    }
  };

  const handleCancel = () => {
    setEditingConfig(null);
    setView('list');
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-8"
        data-testid="api-config-loading"
      >
        <Loader2 className="w-5 h-5 animate-spin text-base-content/50" />
        <span className="ml-2 text-sm text-base-content/50">Loading API configs...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-error text-sm" data-testid="api-config-error">
        Failed to load API configurations: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="api-configuration-panel">
      {/* Header */}
      {view === 'list' && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            API Endpoints
            {configs && configs.length > 0 && (
              <span className="badge badge-sm badge-neutral ml-2">{configs.length}</span>
            )}
          </h3>
          <button
            className="btn btn-xs btn-primary gap-1"
            onClick={() => setView('create')}
            data-testid="add-endpoint-btn"
          >
            <Plus className="w-3 h-3" />
            Add Endpoint
          </button>
        </div>
      )}

      {/* Content based on current view */}
      {view === 'list' && (
        <ApiEndpointList
          configs={configs ?? []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {view === 'create' && (
        <ApiEndpointForm
          onSubmit={handleCreate}
          onCancel={handleCancel}
          isSubmitting={createMutation.isPending}
        />
      )}

      {view === 'edit' && editingConfig && (
        <ApiEndpointForm
          initialValues={editingConfig}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}
