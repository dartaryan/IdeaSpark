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
 * - `window.__apiLog` — array of API call log entries (Story 10.5)
 * - `apiCall(endpointName, options)` — calls configured endpoint (real, mock, or AI)
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
        isAi: cfg.isAi,
      };
      return acc;
    },
    {} as Record<string, unknown>,
  );

  // Build the non-mock code path based on whether proxyConfig is available
  const nonMockCodePath = proxyConfig
    ? generateProxyCodePath(proxyConfig)
    : generateDirectFetchCodePath();

  // Build the AI code path (only when proxyConfig is available — AI needs auth)
  const aiCodePath = proxyConfig
    ? generateAiCodePath(proxyConfig)
    : '';

  return `// Auto-generated API client from IdeaSpark API Configuration
// Do not edit manually — changes will be overwritten when configs are updated.
var API_CONFIG = ${JSON.stringify(configMap, null, 2)};

// Expose config globally for debugging
if (typeof window !== 'undefined') {
  window.__API_CONFIG__ = API_CONFIG;
}

${generateMonitoringHelpers()}

export async function apiCall(endpointName, options = {}) {
  var __callId = 'call-' + (++__apiCallId);
  var __startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  var config = API_CONFIG[endpointName];
  if (!config) {
    throw new Error(
      'API endpoint "' + endpointName + '" not configured. Available: ' + Object.keys(API_CONFIG).join(', ')
    );
  }

  var __logEntry = {
    id: __callId,
    timestamp: new Date().toISOString(),
    endpointName: endpointName,
    method: config.isAi ? 'AI' : (options.method || config.method || 'GET'),
    url: config.isMock ? 'mock://' + endpointName : (config.isAi ? 'prototype-ai-call' : (config.url || '')),
    requestHeaders: __redactHeaders(config.isMock ? {} : (options.headers || config.headers || {})),
    requestBody: __truncateBody(options.body || options.prompt || null),
    responseStatus: 0,
    responseStatusText: '',
    responseHeaders: {},
    responseBody: null,
    durationMs: 0,
    isError: false,
    isAi: !!config.isAi,
    isMock: !!config.isMock,
    errorMessage: null
  };

  try {
    if (config.isMock) {
      if (config.mockDelayMs > 0) {
        await new Promise(function(r) { setTimeout(r, config.mockDelayMs); });
      }
      var __mockOk = config.mockStatusCode >= 200 && config.mockStatusCode < 300;
      __logEntry.responseStatus = config.mockStatusCode;
      __logEntry.responseBody = __truncateBody(config.mockResponse);
      __logEntry.isError = !__mockOk;
      __logEntry.durationMs = __elapsed(__startTime);
      __sendLog(__logEntry);
      return {
        ok: __mockOk,
        status: config.mockStatusCode,
        json: async function() { return config.mockResponse; },
        text: async function() { return JSON.stringify(config.mockResponse); },
      };
    }

${aiCodePath}
${nonMockCodePath}
  } catch (__monitorErr) {
    __logEntry.isError = true;
    __logEntry.errorMessage = __monitorErr.message || 'Unknown error';
    __logEntry.durationMs = __elapsed(__startTime);
    __sendLog(__logEntry);
    throw __monitorErr;
  }
}

export default { call: apiCall, config: API_CONFIG };
`;
}

/**
 * Generate monitoring helper functions for the generated apiClient.js.
 * These are embedded in the generated JavaScript and provide logging,
 * header redaction, body truncation, and postMessage capabilities.
 * (Story 10.5)
 */
function generateMonitoringHelpers(): string {
  return `// --- API Monitoring (Story 10.5) ---
var __apiCallId = 0;
var __apiLog = [];
var __sensitiveHeaders = ['authorization', 'apikey', 'x-api-key', 'cookie', 'x-access-token'];

function __redactHeaders(headers) {
  if (!headers || typeof headers !== 'object') return {};
  var redacted = {};
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (__sensitiveHeaders.indexOf(k.toLowerCase()) >= 0) {
      redacted[k] = '[redacted]';
    } else {
      redacted[k] = headers[k];
    }
  }
  return redacted;
}

function __truncateBody(body) {
  if (body === null || body === undefined) return null;
  try {
    var str = typeof body === 'string' ? body : JSON.stringify(body);
    if (str && str.length > 10240) return str.substring(0, 10240) + '...[truncated]';
    return str;
  } catch(e) { return '[Unable to serialize body]'; }
}

function __elapsed(startTime) {
  return Math.round(((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime) * 100) / 100;
}

function __sendLog(entry) {
  __apiLog.push(entry);
  if (__apiLog.length > 200) __apiLog.shift();
  try {
    parent.postMessage({
      type: 'API_CALL_LOG',
      payload: entry,
      source: 'sandpack-api-monitor'
    }, '*');
  } catch(e) { /* silently fail */ }
}

if (typeof window !== 'undefined') {
  window.__apiLog = __apiLog;
}`;
}

/**
 * Generate the AI code path that routes through the prototype-ai-call Edge Function.
 * Inserted AFTER mock check, BEFORE proxy/direct check in generated apiCall().
 * Includes monitoring hooks for logging each AI call. (Story 10.5)
 */
function generateAiCodePath(proxyConfig: ProxyConfig): string {
  const supabaseUrl = escapeJsString(proxyConfig.supabaseUrl);
  const supabaseAnonKey = escapeJsString(proxyConfig.supabaseAnonKey);
  const prototypeId = escapeJsString(proxyConfig.prototypeId);
  const accessToken = escapeJsString(proxyConfig.accessToken);

  return `    if (config.isAi) {
      // Route through AI Edge Function (Story 10.4)
      var aiUrl = '${supabaseUrl}/functions/v1/prototype-ai-call';
      var aiResponse;
      try {
        aiResponse = await fetch(aiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ${accessToken}',
            'apikey': '${supabaseAnonKey}',
          },
          body: JSON.stringify({
            prototypeId: '${prototypeId}',
            endpointName: endpointName,
            prompt: options.prompt || (typeof options.body === 'string' ? options.body : ''),
            context: options.context || undefined,
          }),
        });
      } catch (fetchErr) {
        __logEntry.isError = true;
        __logEntry.errorMessage = fetchErr.message || 'Network error';
        __logEntry.responseStatus = 0;
        __logEntry.durationMs = __elapsed(__startTime);
        __sendLog(__logEntry);
        return {
          ok: false,
          status: 0,
          statusText: fetchErr.message || 'Network error',
          json: async function() { return { error: fetchErr.message || 'Network error' }; },
          text: async function() { return fetchErr.message || 'Network error'; },
          headers: new Headers(),
        };
      }

      // Parse AI response safely (M3 fix: handle non-JSON responses)
      var aiData;
      try {
        aiData = await aiResponse.json();
      } catch(e) {
        __logEntry.isError = true;
        __logEntry.errorMessage = 'Invalid AI response';
        __logEntry.responseStatus = aiResponse.status;
        __logEntry.durationMs = __elapsed(__startTime);
        __sendLog(__logEntry);
        return {
          ok: false,
          status: aiResponse.status,
          statusText: 'Invalid AI response',
          json: async function() { return { error: 'Invalid AI response' }; },
          text: async function() { return 'Invalid AI response'; },
          headers: new Headers(),
        };
      }

      if (!aiResponse.ok) {
        __logEntry.isError = true;
        __logEntry.errorMessage = aiData.error || aiResponse.statusText;
        __logEntry.responseStatus = aiResponse.status;
        __logEntry.responseBody = __truncateBody(aiData);
        __logEntry.durationMs = __elapsed(__startTime);
        __sendLog(__logEntry);
        return {
          ok: false,
          status: aiResponse.status,
          statusText: aiData.error || aiResponse.statusText,
          json: async function() { return aiData; },
          text: async function() { return JSON.stringify(aiData); },
          headers: new Headers(),
        };
      }

      __logEntry.responseStatus = 200;
      __logEntry.responseStatusText = 'OK';
      __logEntry.responseBody = __truncateBody(aiData);
      __logEntry.durationMs = __elapsed(__startTime);
      __sendLog(__logEntry);
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async function() { return aiData; },
        text: async function() { return aiData.text || JSON.stringify(aiData); },
        headers: new Headers({ 'content-type': 'application/json' }),
      };
    }
`;
}

/**
 * Generate the non-mock code path that routes through the Edge Function proxy.
 * Includes monitoring hooks for logging each proxy call. (Story 10.5)
 */
function generateProxyCodePath(proxyConfig: ProxyConfig): string {
  // Escape values for safe embedding in generated JavaScript string literals
  const supabaseUrl = escapeJsString(proxyConfig.supabaseUrl);
  const supabaseAnonKey = escapeJsString(proxyConfig.supabaseAnonKey);
  const prototypeId = escapeJsString(proxyConfig.prototypeId);
  const accessToken = escapeJsString(proxyConfig.accessToken);

  return `    // Route through Edge Function proxy (Story 10.3)
    var proxyUrl = '${supabaseUrl}/functions/v1/api-proxy';

    // Parse request body safely (H2 fix: handle non-JSON string bodies)
    var parsedBody = undefined;
    if (options.body) {
      if (typeof options.body === 'string') {
        try { parsedBody = JSON.parse(options.body); } catch(e) { parsedBody = options.body; }
      } else {
        parsedBody = options.body;
      }
    }

    var proxyResponse;
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
      __logEntry.isError = true;
      __logEntry.errorMessage = fetchErr.message || 'Network error';
      __logEntry.responseStatus = 0;
      __logEntry.durationMs = __elapsed(__startTime);
      __sendLog(__logEntry);
      return {
        ok: false,
        status: 0,
        statusText: fetchErr.message || 'Network error',
        json: async function() { return { error: fetchErr.message || 'Network error' }; },
        text: async function() { return fetchErr.message || 'Network error'; },
        headers: new Headers(),
      };
    }

    // Parse proxy response safely (M3 fix: handle non-JSON proxy responses)
    var proxyData;
    try {
      proxyData = await proxyResponse.json();
    } catch(e) {
      __logEntry.isError = true;
      __logEntry.errorMessage = 'Invalid proxy response';
      __logEntry.responseStatus = proxyResponse.status;
      __logEntry.durationMs = __elapsed(__startTime);
      __sendLog(__logEntry);
      return {
        ok: false,
        status: proxyResponse.status,
        statusText: proxyResponse.statusText || 'Invalid proxy response',
        json: async function() { return { error: 'Invalid proxy response' }; },
        text: async function() { return 'Invalid proxy response'; },
        headers: new Headers(),
      };
    }

    if (!proxyResponse.ok) {
      __logEntry.isError = true;
      __logEntry.errorMessage = proxyData.error || proxyResponse.statusText;
      __logEntry.responseStatus = proxyData.status || proxyResponse.status;
      __logEntry.responseHeaders = proxyData.headers || {};
      __logEntry.responseBody = __truncateBody(proxyData.body || proxyData);
      __logEntry.durationMs = __elapsed(__startTime);
      __sendLog(__logEntry);
      return {
        ok: false,
        status: proxyData.status || proxyResponse.status,
        statusText: proxyData.error || proxyResponse.statusText,
        json: async function() { return proxyData.body || proxyData; },
        text: async function() { return JSON.stringify(proxyData.body || proxyData); },
        headers: new Headers(proxyData.headers || {}),
      };
    }

    var __proxyOk = proxyData.status >= 200 && proxyData.status < 300;
    __logEntry.responseStatus = proxyData.status;
    __logEntry.responseStatusText = proxyData.statusText || '';
    __logEntry.responseHeaders = proxyData.headers || {};
    __logEntry.responseBody = __truncateBody(proxyData.body);
    __logEntry.isError = !__proxyOk;
    __logEntry.durationMs = __elapsed(__startTime);
    __sendLog(__logEntry);
    return {
      ok: __proxyOk,
      status: proxyData.status,
      statusText: proxyData.statusText || '',
      json: async function() { return proxyData.body; },
      text: async function() { return typeof proxyData.body === 'string' ? proxyData.body : JSON.stringify(proxyData.body); },
      headers: new Headers(proxyData.headers || {}),
    };`;
}

/**
 * Generate the non-mock code path that makes direct fetch calls (fallback when no proxyConfig).
 * Includes monitoring hooks for logging each direct call. (Story 10.5)
 */
function generateDirectFetchCodePath(): string {
  return `    var mergedHeaders = Object.assign({}, config.headers || {}, options.headers || {});
    var __directResponse;
    try {
      __directResponse = await fetch(config.url, {
        method: config.method,
        headers: mergedHeaders,
        body: options.body || undefined,
      });
      __logEntry.responseStatus = __directResponse.status;
      __logEntry.responseStatusText = __directResponse.statusText || '';
      __logEntry.isError = !__directResponse.ok;
      try {
        var __cloned = __directResponse.clone();
        var __bodyText = await __cloned.text();
        __logEntry.responseBody = __truncateBody(__bodyText);
      } catch(e) { /* body capture failed, continue */ }
    } catch (__fetchErr) {
      __logEntry.isError = true;
      __logEntry.errorMessage = __fetchErr.message || 'Network error';
      __logEntry.responseStatus = 0;
      __logEntry.durationMs = __elapsed(__startTime);
      __sendLog(__logEntry);
      return {
        ok: false,
        status: 0,
        statusText: __fetchErr.message || 'Network error',
        json: async function() { return { error: __fetchErr.message || 'Network error' }; },
        text: async function() { return __fetchErr.message || 'Network error'; },
        headers: new Headers(),
      };
    }
    __logEntry.durationMs = __elapsed(__startTime);
    __sendLog(__logEntry);
    return __directResponse;`;
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
