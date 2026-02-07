// src/features/prototypes/utils/apiClientInjector.ts

import type { ApiConfig } from '../types';

/**
 * Generate a Sandpack-injectable `apiClient.js` file from endpoint configurations.
 *
 * The generated file exposes:
 * - `window.__API_CONFIG__` — raw config map for debugging
 * - `apiCall(endpointName, options)` — calls configured endpoint (real or mock)
 * - `default export { call: apiCall, config: API_CONFIG }` — convenience object
 *
 * @param configs - Array of API endpoint configurations
 * @returns JavaScript source code string for the apiClient file
 */
export function generateApiClientFile(configs: ApiConfig[]): string {
  const configMap = configs.reduce(
    (acc, cfg) => {
      acc[cfg.name] = {
        url: cfg.url,
        method: cfg.method,
        headers: cfg.headers,
        isMock: cfg.isMock,
        mockResponse: cfg.mockResponse,
        mockStatusCode: cfg.mockStatusCode,
        mockDelayMs: cfg.mockDelayMs,
      };
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return `// Auto-generated API client from IdeaSpark API Configuration
// Do not edit manually — changes will be overwritten when configs are updated.
const API_CONFIG = ${JSON.stringify(configMap, null, 2)};

// Expose config globally for debugging
if (typeof window !== 'undefined') {
  window.__API_CONFIG__ = API_CONFIG;
}

export async function apiCall(endpointName, options = {}) {
  const config = API_CONFIG[endpointName];
  if (!config) {
    throw new Error(
      \`API endpoint "\${endpointName}" not configured. Available: \${Object.keys(API_CONFIG).join(', ')}\`
    );
  }

  if (config.isMock) {
    if (config.mockDelayMs > 0) {
      await new Promise((r) => setTimeout(r, config.mockDelayMs));
    }
    return {
      ok: config.mockStatusCode >= 200 && config.mockStatusCode < 300,
      status: config.mockStatusCode,
      json: async () => config.mockResponse,
      text: async () => JSON.stringify(config.mockResponse),
    };
  }

  const mergedHeaders = { ...config.headers, ...(options.headers || {}) };
  return fetch(config.url, {
    method: config.method,
    headers: mergedHeaders,
    ...options,
  });
}

export default { call: apiCall, config: API_CONFIG };
`;
}
