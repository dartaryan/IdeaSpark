// src/features/prototypes/utils/apiClientInjector.ts

import type { ApiConfig } from '../types';

/**
 * Configuration for routing non-mock API calls through the Supabase Edge Function proxy.
 * All values are embedded as string literals in the generated JavaScript.
 */
export interface ProxyConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  prototypeId: string;
  accessToken: string;
}

/**
 * Generate a Sandpack-injectable `apiClient.js` file from endpoint configurations.
 *
 * The generated file exposes:
 * - `window.__API_CONFIG__` — raw config map for debugging
 * - `apiCall(endpointName, options)` — calls configured endpoint (real or mock)
 * - `default export { call: apiCall, config: API_CONFIG }` — convenience object
 *
 * @param configs - Array of API endpoint configurations
 * @param proxyConfig - Optional proxy config; when provided, non-mock calls route through the Edge Function proxy
 * @returns JavaScript source code string for the apiClient file
 */
export function generateApiClientFile(configs: ApiConfig[], proxyConfig?: ProxyConfig): string {
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

  // Build the non-mock code path based on whether proxyConfig is available
  const nonMockCodePath = proxyConfig
    ? generateProxyCodePath(proxyConfig)
    : generateDirectFetchCodePath();

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

${nonMockCodePath}
}

export default { call: apiCall, config: API_CONFIG };
`;
}

/**
 * Generate the non-mock code path that routes through the Edge Function proxy.
 */
function generateProxyCodePath(proxyConfig: ProxyConfig): string {
  // Escape values for safe embedding in generated JavaScript string literals
  const supabaseUrl = escapeJsString(proxyConfig.supabaseUrl);
  const supabaseAnonKey = escapeJsString(proxyConfig.supabaseAnonKey);
  const prototypeId = escapeJsString(proxyConfig.prototypeId);
  const accessToken = escapeJsString(proxyConfig.accessToken);

  return `  // Route through Edge Function proxy (Story 10.3)
  const proxyUrl = '${supabaseUrl}/functions/v1/api-proxy';

  // Parse request body safely (H2 fix: handle non-JSON string bodies)
  let parsedBody = undefined;
  if (options.body) {
    if (typeof options.body === 'string') {
      try { parsedBody = JSON.parse(options.body); } catch { parsedBody = options.body; }
    } else {
      parsedBody = options.body;
    }
  }

  let proxyResponse;
  try {
    proxyResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${accessToken}',
        'apikey': '${supabaseAnonKey}',
      },
      body: JSON.stringify({
        prototypeId: '${prototypeId}',
        endpointName: endpointName,
        body: parsedBody,
        method: config.method,
        headers: options.headers || {},
      }),
    });
  } catch (fetchErr) {
    return {
      ok: false,
      status: 0,
      statusText: fetchErr.message || 'Network error',
      json: async () => ({ error: fetchErr.message || 'Network error' }),
      text: async () => fetchErr.message || 'Network error',
      headers: new Headers(),
    };
  }

  // Parse proxy response safely (M3 fix: handle non-JSON proxy responses)
  let proxyData;
  try {
    proxyData = await proxyResponse.json();
  } catch {
    return {
      ok: false,
      status: proxyResponse.status,
      statusText: proxyResponse.statusText || 'Invalid proxy response',
      json: async () => ({ error: 'Invalid proxy response' }),
      text: async () => 'Invalid proxy response',
      headers: new Headers(),
    };
  }

  if (!proxyResponse.ok) {
    return {
      ok: false,
      status: proxyData.status || proxyResponse.status,
      statusText: proxyData.error || proxyResponse.statusText,
      json: async () => proxyData.body || proxyData,
      text: async () => JSON.stringify(proxyData.body || proxyData),
      headers: new Headers(proxyData.headers || {}),
    };
  }

  return {
    ok: proxyData.status >= 200 && proxyData.status < 300,
    status: proxyData.status,
    statusText: proxyData.statusText || '',
    json: async () => proxyData.body,
    text: async () => typeof proxyData.body === 'string' ? proxyData.body : JSON.stringify(proxyData.body),
    headers: new Headers(proxyData.headers || {}),
  };`;
}

/**
 * Generate the non-mock code path that makes direct fetch calls (fallback when no proxyConfig).
 */
function generateDirectFetchCodePath(): string {
  return `  const mergedHeaders = { ...config.headers, ...(options.headers || {}) };
  return fetch(config.url, {
    method: config.method,
    headers: mergedHeaders,
    ...options,
  });`;
}

/**
 * Escape a string for safe embedding in a JavaScript single-quoted string literal.
 */
function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}
