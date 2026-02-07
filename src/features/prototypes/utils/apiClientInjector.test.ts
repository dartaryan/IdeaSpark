// src/features/prototypes/utils/apiClientInjector.test.ts

import { describe, it, expect } from 'vitest';
import { generateApiClientFile } from './apiClientInjector';
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
});
