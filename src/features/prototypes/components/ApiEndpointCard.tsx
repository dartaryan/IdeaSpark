// src/features/prototypes/components/ApiEndpointCard.tsx

import { Pencil, Trash2 } from 'lucide-react';
import type { ApiConfig } from '../types';

/** Color mapping for HTTP method badges */
const METHOD_COLORS: Record<string, string> = {
  GET: 'badge-success',
  POST: 'badge-info',
  PUT: 'badge-warning',
  PATCH: 'badge-warning',
  DELETE: 'badge-error',
};

export interface ApiEndpointCardProps {
  config: ApiConfig;
  onEdit: (config: ApiConfig) => void;
  onDelete: (config: ApiConfig) => void;
}

/**
 * Compact card displaying a single API endpoint configuration.
 * Shows Name, URL, Method badge, Mock/Live badge, and action buttons.
 */
export function ApiEndpointCard({ config, onEdit, onDelete }: ApiEndpointCardProps) {
  const methodColor = METHOD_COLORS[config.method] || 'badge-neutral';

  return (
    <div
      className="card card-compact bg-base-100 shadow-sm border border-base-300"
      data-testid={`api-endpoint-card-${config.name}`}
    >
      <div className="card-body flex-row items-center justify-between gap-3">
        {/* Left side: Name, URL, badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate" title={config.name}>
              {config.name}
            </span>
            <span className={`badge badge-xs ${methodColor}`}>{config.method}</span>
            <span
              className={`badge badge-xs ${config.isMock ? 'badge-warning' : 'badge-success'}`}
            >
              {config.isMock ? 'Mock' : 'Live'}
            </span>
          </div>
          <p className="text-xs text-base-content/60 truncate mt-0.5" title={config.url}>
            {config.url}
          </p>
        </div>

        {/* Right side: Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="btn btn-ghost btn-xs btn-square"
            onClick={() => onEdit(config)}
            aria-label={`Edit ${config.name}`}
            data-testid={`edit-endpoint-${config.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="btn btn-ghost btn-xs btn-square text-error"
            onClick={() => onDelete(config)}
            aria-label={`Delete ${config.name}`}
            data-testid={`delete-endpoint-${config.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
