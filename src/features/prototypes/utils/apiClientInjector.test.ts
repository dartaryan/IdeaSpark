// src/features/prototypes/utils/apiClientInjector.test.ts

import { describe, it, expect } from 'vitest';
import { generateApiClientFile } from './apiClientInjector';
import type { ProxyConfig } from './apiClientInjector';
import type { ApiConfig } from '../types';

const makeConfig = (overrides: Partial<ApiConfig> = {}): ApiConfig => ({
  id: 'cfg-1',
  prototypeId: 'proto-1',
  name: 'getUsers',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: {},
  isMock: false,
  mockResponse: null,
  mockStatusCode: 200,
  mockDelayMs: 0,
  isAi: false,
  aiModel: null,
  aiSystemPrompt: null,
  aiMaxTokens: null,
  aiTemperature: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeProxyConfig = (overrides: Partial<ProxyConfig> = {}): ProxyConfig => ({
  supabaseUrl: 'https://abc.supabase.co',
  supabaseAnonKey: 'test-anon-key-123',
  prototypeId: 'proto-1',
  accessToken: 'test-access-token-xyz',
  ...overrides,
});

describe('generateApiClientFile', () => {
  it('should generate valid JavaScript with a single config', () => {
    const result = generateApiClientFile([makeConfig()]);

    expect(result).toContain('var API_CONFIG =');
    expect(result).toContain('"getUsers"');
    expect(result).toContain('https://api.example.com/users');
    expect(result).toContain('export async function apiCall');
    expect(result).toContain('export default');
  });

  it('should include all config properties', () => {
    const result = generateApiClientFile([
      makeConfig({
        name: 'createUser',
        url: 'https://api.example.com/users',
        method: 'POST',
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        isMock: true,
        mockResponse: { id: 1, name: 'Test' },
        mockStatusCode: 201,
        mockDelayMs: 500,
      }),
    ]);

    expect(result).toContain('"createUser"');
    expect(result).toContain('"POST"');
    expect(result).toContain('"Authorization"');
    expect(result).toContain('"Bearer token"');
    expect(result).toContain('"isMock": true');
    expect(result).toContain('"mockStatusCode": 201');
    expect(result).toContain('"mockDelayMs": 500');
  });

  it('should handle multiple configs', () => {
    const result = generateApiClientFile([
      makeConfig({ name: 'getUsers' }),
      makeConfig({ name: 'createUser', method: 'POST' }),
      makeConfig({ name: 'deleteUser', method: 'DELETE' }),
    ]);

    expect(result).toContain('"getUsers"');
    expect(result).toContain('"createUser"');
    expect(result).toContain('"deleteUser"');
  });

  it('should handle empty configs array', () => {
    const result = generateApiClientFile([]);

    expect(result).toContain('var API_CONFIG = {}');
    expect(result).toContain('export async function apiCall');
  });

  it('should generate mock mode handling code', () => {
    const result = generateApiClientFile([makeConfig({ isMock: true })]);

    expect(result).toContain('config.isMock');
    expect(result).toContain('config.mockDelayMs');
    expect(result).toContain('config.mockStatusCode');
    expect(result).toContain('config.mockResponse');
  });

  it('should generate error handling for unknown endpoints', () => {
    const result = generateApiClientFile([makeConfig()]);

    expect(result).toContain('not configured');
    expect(result).toContain('Object.keys(API_CONFIG)');
  });

  it('should set window.__API_CONFIG__', () => {
    const result = generateApiClientFile([makeConfig()]);

    expect(result).toContain('window.__API_CONFIG__');
  });

  it('should not include id, prototypeId, createdAt, updatedAt in output', () => {
    const result = generateApiClientFile([makeConfig()]);

    // These internal fields should NOT be in the generated client
    expect(result).not.toContain('"cfg-1"');
    expect(result).not.toContain('"proto-1"');
    expect(result).not.toContain('"createdAt"');
    expect(result).not.toContain('"updatedAt"');
  });

  // =========================================================================
  // Story 10.3: Proxy routing tests
  // =========================================================================

  describe('proxy routing (Story 10.3)', () => {
    it('should generate proxy code path when proxyConfig is provided for non-mock endpoints', () => {
      const result = generateApiClientFile([makeConfig({ isMock: false })], makeProxyConfig());

      expect(result).toContain('/functions/v1/api-proxy');
      expect(result).toContain('https://abc.supabase.co');
      expect(result).toContain('test-access-token-xyz');
      expect(result).toContain('test-anon-key-123');
      expect(result).toContain('proto-1');
    });

    it('should still use mock logic for mock endpoints even when proxyConfig is provided', () => {
      const result = generateApiClientFile(
        [makeConfig({ isMock: true, mockResponse: { data: 'mocked' }, mockStatusCode: 200 })],
        makeProxyConfig(),
      );

      // Mock path should still be present
      expect(result).toContain('config.isMock');
      expect(result).toContain('config.mockResponse');
      expect(result).toContain('config.mockStatusCode');
    });

    it('should generate direct fetch fallback when proxyConfig is NOT provided', () => {
      const result = generateApiClientFile([makeConfig({ isMock: false })]);

      // Direct fetch path (no proxy)
      expect(result).toContain('fetch(config.url');
      expect(result).toContain('method: config.method');
      // Should NOT contain proxy references
      expect(result).not.toContain('/functions/v1/api-proxy');
      expect(result).not.toContain('proxyUrl');
    });

    it('should embed Supabase URL in generated proxy code', () => {
      const result = generateApiClientFile(
        [makeConfig()],
        makeProxyConfig({ supabaseUrl: 'https://my-project.supabase.co' }),
      );

      expect(result).toContain('https://my-project.supabase.co/functions/v1/api-proxy');
    });

    it('should embed auth token in generated proxy code', () => {
      const result = generateApiClientFile(
        [makeConfig()],
        makeProxyConfig({ accessToken: 'my-jwt-token-abc' }),
      );

      expect(result).toContain("'Bearer my-jwt-token-abc'");
    });

    it('should embed anon key as apikey header in generated proxy code', () => {
      const result = generateApiClientFile(
        [makeConfig()],
        makeProxyConfig({ supabaseAnonKey: 'anon-key-456' }),
      );

      expect(result).toContain("'apikey': 'anon-key-456'");
    });

    it('should embed prototypeId in generated proxy request body', () => {
      const result = generateApiClientFile(
        [makeConfig()],
        makeProxyConfig({ prototypeId: 'my-proto-id-789' }),
      );

      expect(result).toContain("prototypeId: 'my-proto-id-789'");
    });

    it('should generate error handling for proxy error responses', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      // Should handle proxy errors: return structured response with ok: false
      expect(result).toContain('!proxyResponse.ok');
      expect(result).toContain('ok: false');
      expect(result).toContain('proxyData.error');
    });

    it('should generate response objects with json() and text() methods for proxy calls', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      // Success response: json/text methods (using function expressions for Sandpack compatibility)
      expect(result).toContain('json: async function() { return proxyData.body; }');
      expect(result).toContain('text: async function()');
      // Response properties
      expect(result).toContain('status: proxyData.status');
      expect(result).toContain('statusText: proxyData.statusText');
    });

    it('should handle mixed mock and non-mock endpoints with proxyConfig', () => {
      const configs = [
        makeConfig({ name: 'mockEndpoint', isMock: true, mockResponse: { mock: true } }),
        makeConfig({ name: 'realEndpoint', isMock: false, url: 'https://real-api.com' }),
      ];
      const result = generateApiClientFile(configs, makeProxyConfig());

      // Both endpoints in config
      expect(result).toContain('"mockEndpoint"');
      expect(result).toContain('"realEndpoint"');
      // Mock logic present
      expect(result).toContain('config.isMock');
      // Proxy logic present
      expect(result).toContain('/functions/v1/api-proxy');
    });

    it('should escape special characters in proxyConfig values', () => {
      const result = generateApiClientFile(
        [makeConfig()],
        makeProxyConfig({ accessToken: "token-with-'quotes'" }),
      );

      // Should not break the generated JavaScript
      expect(result).toContain('token-with-');
      // Should be properly escaped (no unescaped single quotes breaking the string)
      expect(result).not.toMatch(/Bearer token-with-'quotes'/);
    });

    it('should safely parse non-JSON string body in generated proxy code (H2 fix)', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      // Should have try/catch around JSON.parse for body
      expect(result).toContain('try { parsedBody = JSON.parse(options.body); } catch');
      // Should use parsedBody in the request
      expect(result).toContain('body: parsedBody');
    });

    it('should handle non-JSON proxy response gracefully in generated code (M3 fix)', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      // Should wrap proxyResponse.json() in try/catch
      expect(result).toContain('proxyData = await proxyResponse.json()');
      expect(result).toContain('Invalid proxy response');
    });

    it('should handle network errors when calling proxy in generated code', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      // Should wrap fetch in try/catch
      expect(result).toContain('} catch (fetchErr)');
      expect(result).toContain('Network error');
    });

    it('backward compatibility: generateApiClientFile(configs) without proxyConfig still works', () => {
      const result = generateApiClientFile([makeConfig()]);

      // Should generate valid code with direct fetch
      expect(result).toContain('var API_CONFIG =');
      expect(result).toContain('export async function apiCall');
      expect(result).toContain('fetch(config.url');
      expect(result).toContain('export default');
    });
  });

  // =========================================================================
  // Story 10.4: AI routing tests
  // =========================================================================

  describe('AI routing (Story 10.4)', () => {
    const makeAiConfig = (overrides: Partial<ApiConfig> = {}): ApiConfig =>
      makeConfig({
        name: 'generateDescription',
        isAi: true,
        isMock: false,
        aiModel: 'gemini-2.5-flash',
        aiSystemPrompt: 'You are a helpful assistant.',
        aiMaxTokens: 1024,
        aiTemperature: 0.7,
        ...overrides,
      });

    it('should include isAi field in generated config map', () => {
      const result = generateApiClientFile([makeAiConfig()]);

      expect(result).toContain('"isAi": true');
    });

    it('should generate AI code path when proxyConfig is provided for AI endpoints', () => {
      const result = generateApiClientFile([makeAiConfig()], makeProxyConfig());

      expect(result).toContain('/functions/v1/prototype-ai-call');
      expect(result).toContain('config.isAi');
    });

    it('should route AI endpoint through prototype-ai-call Edge Function URL', () => {
      const result = generateApiClientFile(
        [makeAiConfig()],
        makeProxyConfig({ supabaseUrl: 'https://my-project.supabase.co' }),
      );

      expect(result).toContain('https://my-project.supabase.co/functions/v1/prototype-ai-call');
    });

    it('should embed auth credentials in AI code path', () => {
      const result = generateApiClientFile(
        [makeAiConfig()],
        makeProxyConfig({ accessToken: 'ai-jwt-token', supabaseAnonKey: 'ai-anon-key' }),
      );

      expect(result).toContain("'Bearer ai-jwt-token'");
      expect(result).toContain("'apikey': 'ai-anon-key'");
    });

    it('should embed prototypeId in AI request body', () => {
      const result = generateApiClientFile(
        [makeAiConfig()],
        makeProxyConfig({ prototypeId: 'ai-proto-123' }),
      );

      expect(result).toContain("prototypeId: 'ai-proto-123'");
    });

    it('should send prompt and context fields in AI request', () => {
      const result = generateApiClientFile([makeAiConfig()], makeProxyConfig());

      expect(result).toContain('prompt: options.prompt');
      expect(result).toContain('context: options.context');
    });

    it('should use mock path for AI endpoint with isMock=true, not AI path', () => {
      const result = generateApiClientFile(
        [makeAiConfig({ isMock: true, mockResponse: { text: 'mocked' }, mockStatusCode: 200 })],
        makeProxyConfig(),
      );

      // Mock path should still work (config.isMock is checked first)
      expect(result).toContain('config.isMock');
      expect(result).toContain('config.mockResponse');
    });

    it('should not generate AI code path when proxyConfig is NOT provided', () => {
      const result = generateApiClientFile([makeAiConfig()]);

      // Without proxyConfig, no AI path (AI needs auth)
      expect(result).not.toContain('/functions/v1/prototype-ai-call');
    });

    it('should handle non-AI endpoints unchanged when AI code path is present', () => {
      const result = generateApiClientFile(
        [makeConfig({ name: 'regularEndpoint', isAi: false })],
        makeProxyConfig(),
      );

      // Proxy path for non-AI, non-mock endpoints
      expect(result).toContain('/functions/v1/api-proxy');
      expect(result).toContain('"isAi": false');
    });

    it('should handle mixed AI, regular, and mock endpoints', () => {
      const configs = [
        makeAiConfig({ name: 'aiEndpoint' }),
        makeConfig({ name: 'regularEndpoint', isAi: false, isMock: false }),
        makeConfig({ name: 'mockEndpoint', isAi: false, isMock: true, mockResponse: { data: 1 } }),
      ];
      const result = generateApiClientFile(configs, makeProxyConfig());

      expect(result).toContain('"aiEndpoint"');
      expect(result).toContain('"regularEndpoint"');
      expect(result).toContain('"mockEndpoint"');
      // All three code paths present
      expect(result).toContain('config.isAi');
      expect(result).toContain('config.isMock');
      expect(result).toContain('/functions/v1/prototype-ai-call');
      expect(result).toContain('/functions/v1/api-proxy');
    });

    it('should generate error handling for AI network errors', () => {
      const result = generateApiClientFile([makeAiConfig()], makeProxyConfig());

      expect(result).toContain('} catch (fetchErr)');
      expect(result).toContain('Network error');
    });

    it('should generate error handling for non-JSON AI response (M3 fix)', () => {
      const result = generateApiClientFile([makeAiConfig()], makeProxyConfig());

      expect(result).toContain('Invalid AI response');
    });

    it('should generate response objects with json() and text() methods for AI calls', () => {
      const result = generateApiClientFile([makeAiConfig()], makeProxyConfig());

      // AI success response shape (using function expressions for Sandpack compatibility)
      expect(result).toContain('json: async function() { return aiData; }');
      expect(result).toContain('text: async function()');
    });

    it('should handle AI error responses (non-ok status)', () => {
      const result = generateApiClientFile([makeAiConfig()], makeProxyConfig());

      expect(result).toContain('!aiResponse.ok');
      expect(result).toContain('ok: false');
    });

    it('should escape special characters in proxyConfig values for AI path', () => {
      const result = generateApiClientFile(
        [makeAiConfig()],
        makeProxyConfig({ accessToken: "token-with-'quotes'" }),
      );

      // Should be properly escaped
      expect(result).toContain('token-with-');
      expect(result).not.toMatch(/Bearer token-with-'quotes'/);
    });
  });

  // =========================================================================
  // Story 10.5: API Monitoring tests
  // =========================================================================

  describe('API monitoring (Story 10.5)', () => {
    it('should generate monitoring variables (__apiCallId, __apiLog)', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('var __apiCallId = 0');
      expect(result).toContain('var __apiLog = []');
    });

    it('should generate __sendLog function with postMessage', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('function __sendLog(entry)');
      expect(result).toContain("type: 'API_CALL_LOG'");
      expect(result).toContain("source: 'sandpack-api-monitor'");
      expect(result).toContain('parent.postMessage');
    });

    it('should generate __redactHeaders function', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('function __redactHeaders(headers)');
      expect(result).toContain("'[redacted]'");
      expect(result).toContain("'authorization'");
      expect(result).toContain("'apikey'");
    });

    it('should generate __truncateBody function with 10KB limit', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('function __truncateBody(body)');
      expect(result).toContain('10240');
      expect(result).toContain('...[truncated]');
    });

    it('should generate __elapsed function using performance.now', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('function __elapsed(startTime)');
      expect(result).toContain('performance.now()');
    });

    it('should expose window.__apiLog', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('window.__apiLog = __apiLog');
    });

    it('should create __logEntry with all required fields at apiCall start', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('var __logEntry = {');
      expect(result).toContain('id: __callId');
      expect(result).toContain('timestamp:');
      expect(result).toContain('endpointName: endpointName');
      expect(result).toContain('method:');
      expect(result).toContain('requestHeaders: __redactHeaders');
      expect(result).toContain('requestBody: __truncateBody');
      expect(result).toContain('responseStatus: 0');
      expect(result).toContain('isAi:');
      expect(result).toContain('isMock:');
    });

    it('should log mock responses before returning', () => {
      const result = generateApiClientFile([
        makeConfig({ isMock: true, mockResponse: { data: 'test' } }),
      ]);

      // Mock path should log before returning
      expect(result).toContain('__logEntry.responseStatus = config.mockStatusCode');
      expect(result).toContain('__logEntry.responseBody = __truncateBody(config.mockResponse)');
      expect(result).toContain('__sendLog(__logEntry)');
    });

    it('should log AI responses before returning (with proxyConfig)', () => {
      const result = generateApiClientFile(
        [makeConfig({ isAi: true, isMock: false })],
        makeProxyConfig(),
      );

      // AI success path should log aiData
      expect(result).toContain('__logEntry.responseBody = __truncateBody(aiData)');
      expect(result).toContain('__sendLog(__logEntry)');
    });

    it('should log proxy responses before returning', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      // Proxy success path should log proxyData.body
      expect(result).toContain('__logEntry.responseBody = __truncateBody(proxyData.body)');
    });

    it('should log direct fetch responses with clone', () => {
      const result = generateApiClientFile([makeConfig()]);

      // Direct fetch path should clone for body capture
      expect(result).toContain('__directResponse.clone()');
      expect(result).toContain('__logEntry.responseBody = __truncateBody(__bodyText)');
    });

    it('should return structured error response (not throw) in direct fetch error path', () => {
      const result = generateApiClientFile([makeConfig()]);

      // Direct fetch error path should return a structured response (consistent with proxy/AI)
      // and NOT re-throw (which would cause double-logging via the outer catch)
      expect(result).toContain('ok: false');
      expect(result).toContain("statusText: __fetchErr.message || 'Network error'");
      // Should NOT re-throw inside the inner catch
      expect(result).not.toMatch(/catch \(__fetchErr\)[\s\S]*?throw __fetchErr/);
    });

    it('should capture proxy response headers in log entries', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      // Proxy success and error paths should capture response headers
      expect(result).toContain('__logEntry.responseHeaders = proxyData.headers || {}');
    });

    it('should log errors in AI network error catch', () => {
      const result = generateApiClientFile(
        [makeConfig({ isAi: true })],
        makeProxyConfig(),
      );

      expect(result).toContain('__logEntry.isError = true');
      expect(result).toContain('__logEntry.errorMessage = fetchErr.message');
    });

    it('should log errors in proxy network error catch', () => {
      const result = generateApiClientFile([makeConfig()], makeProxyConfig());

      expect(result).toContain('__logEntry.isError = true');
      expect(result).toContain('__logEntry.errorMessage = fetchErr.message');
    });

    it('should have outer catch block for monitoring errors', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('catch (__monitorErr)');
      expect(result).toContain('__logEntry.errorMessage = __monitorErr.message');
      expect(result).toContain('throw __monitorErr');
    });

    it('should use var declarations in generated monitoring code', () => {
      const result = generateApiClientFile([makeConfig()]);

      // All monitoring variables should use var for Sandpack compatibility
      expect(result).toContain('var __apiCallId');
      expect(result).toContain('var __apiLog');
      expect(result).toContain('var __callId');
      expect(result).toContain('var __startTime');
      expect(result).toContain('var __logEntry');
    });

    it('should generate timing capture at apiCall start', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain("var __startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()");
    });

    it('should generate incrementing callId', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain("var __callId = 'call-' + (++__apiCallId)");
    });

    it('should cap __apiLog at 200 entries', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain('if (__apiLog.length > 200) __apiLog.shift()');
    });

    it('should set url to mock:// for mock endpoints in log', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain("url: config.isMock ? 'mock://' + endpointName");
    });

    it('should set method to AI for AI endpoints in log', () => {
      const result = generateApiClientFile([makeConfig()]);

      expect(result).toContain("method: config.isAi ? 'AI'");
    });

    it('monitoring code should not break mock response interface', () => {
      const result = generateApiClientFile([
        makeConfig({ isMock: true, mockResponse: { test: true } }),
      ]);

      // Mock response should still have ok, status, json, text
      expect(result).toContain('ok: __mockOk');
      expect(result).toContain('status: config.mockStatusCode');
      expect(result).toContain('json: async function() { return config.mockResponse; }');
      expect(result).toContain('text: async function() { return JSON.stringify(config.mockResponse); }');
    });
  });
});
