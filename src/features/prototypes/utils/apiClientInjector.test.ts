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

    expect(result).toContain('const API_CONFIG =');
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

    expect(result).toContain('const API_CONFIG = {}');
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

      // Success response: json/text methods
      expect(result).toContain('json: async () => proxyData.body');
      expect(result).toContain('text: async ()');
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
      expect(result).toContain('const API_CONFIG =');
      expect(result).toContain('export async function apiCall');
      expect(result).toContain('fetch(config.url');
      expect(result).toContain('export default');
    });
  });
});
