// src/features/prototypes/components/ApiEndpointList.tsx

import { ApiEndpointCard } from './ApiEndpointCard';
import type { ApiConfig } from '../types';

export interface ApiEndpointListProps {
  configs: ApiConfig[];
  onEdit: (config: ApiConfig) => void;
  onDelete: (config: ApiConfig) => void;
}

/**
 * Renders a list of API endpoint cards, or an empty state message.
 */
export function ApiEndpointList({ configs, onEdit, onDelete }: ApiEndpointListProps) {
  if (configs.length === 0) {
    return (
      <div
        className="text-center py-8 text-base-content/50"
        data-testid="api-endpoint-list-empty"
      >
        <p className="text-sm">No API endpoints configured yet.</p>
        <p className="text-xs mt-1">
          Configure API endpoints to make real or mock API calls from your prototype.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="api-endpoint-list">
      {configs.map((config) => (
        <ApiEndpointCard
          key={config.id}
          config={config}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
