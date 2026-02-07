// src/features/prototypes/services/apiConfigService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiConfigService } from './apiConfigService';

// Mock supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

// Helper to build chainable mock
function buildChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    order: mockOrder,
    single: mockSingle,
    ...overrides,
  };

  // Make each method return the chain (fluent interface)
  for (const fn of Object.values(chain)) {
    fn.mockReturnValue(chain);
  }

  mockFrom.mockReturnValue(chain);
  return chain;
}

const sampleRow = {
  id: 'cfg-1',
  prototype_id: 'proto-1',
  name: 'getUsers',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: {},
  is_mock: false,
  mock_response: null,
  mock_status_code: 200,
  mock_delay_ms: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('apiConfigService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getApiConfigs', () => {
    it('should return configs for a prototype', async () => {
      const chain = buildChain();
      chain.order.mockResolvedValue({ data: [sampleRow], error: null });

      const result = await apiConfigService.getApiConfigs('proto-1');

      expect(mockFrom).toHaveBeenCalledWith('prototype_api_configs');
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe('getUsers');
      expect(result.data![0].prototypeId).toBe('proto-1');
    });

    it('should return error on DB failure', async () => {
      const chain = buildChain();
      chain.order.mockResolvedValue({ data: null, error: { message: 'DB error', code: 'ERROR' } });

      const result = await apiConfigService.getApiConfigs('proto-1');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error!.code).toBe('DB_ERROR');
    });

    it('should return empty array when no configs exist', async () => {
      const chain = buildChain();
      chain.order.mockResolvedValue({ data: [], error: null });

      const result = await apiConfigService.getApiConfigs('proto-1');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('createApiConfig', () => {
    it('should create a new config', async () => {
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: sampleRow, error: null });

      const result = await apiConfigService.createApiConfig({
        prototypeId: 'proto-1',
        name: 'getUsers',
        url: 'https://api.example.com/users',
        method: 'GET',
      });

      expect(mockFrom).toHaveBeenCalledWith('prototype_api_configs');
      expect(result.error).toBeNull();
      expect(result.data!.name).toBe('getUsers');
    });

    it('should handle duplicate name error', async () => {
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: null, error: { message: 'duplicate', code: '23505' } });

      const result = await apiConfigService.createApiConfig({
        prototypeId: 'proto-1',
        name: 'getUsers',
        url: 'https://api.example.com/users',
        method: 'GET',
      });

      expect(result.data).toBeNull();
      expect(result.error!.code).toBe('DUPLICATE_ERROR');
    });

    it('should handle general DB error', async () => {
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: null, error: { message: 'error', code: 'OTHER' } });

      const result = await apiConfigService.createApiConfig({
        prototypeId: 'proto-1',
        name: 'test',
        url: 'https://example.com',
        method: 'GET',
      });

      expect(result.error!.code).toBe('DB_ERROR');
    });
  });

  describe('updateApiConfig', () => {
    it('should update an existing config', async () => {
      const updatedRow = { ...sampleRow, name: 'updatedName' };
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: updatedRow, error: null });

      const result = await apiConfigService.updateApiConfig('cfg-1', { name: 'updatedName' });

      expect(result.error).toBeNull();
      expect(result.data!.name).toBe('updatedName');
    });

    it('should handle not found error', async () => {
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: null, error: { message: 'not found', code: 'PGRST116' } });

      const result = await apiConfigService.updateApiConfig('nonexistent', { name: 'test' });

      expect(result.error!.code).toBe('NOT_FOUND');
    });

    it('should handle duplicate name on update', async () => {
      const chain = buildChain();
      chain.single.mockResolvedValue({ data: null, error: { message: 'duplicate', code: '23505' } });

      const result = await apiConfigService.updateApiConfig('cfg-1', { name: 'duplicate' });

      expect(result.error!.code).toBe('DUPLICATE_ERROR');
    });
  });

  describe('deleteApiConfig', () => {
    it('should delete a config', async () => {
      const chain = buildChain();
      chain.eq.mockResolvedValue({ error: null });

      const result = await apiConfigService.deleteApiConfig('cfg-1');

      expect(mockFrom).toHaveBeenCalledWith('prototype_api_configs');
      expect(result.error).toBeNull();
    });

    it('should handle delete error', async () => {
      const chain = buildChain();
      chain.eq.mockResolvedValue({ error: { message: 'error' } });

      const result = await apiConfigService.deleteApiConfig('cfg-1');

      expect(result.error).toBeTruthy();
      expect(result.error!.code).toBe('DB_ERROR');
    });
  });
});
