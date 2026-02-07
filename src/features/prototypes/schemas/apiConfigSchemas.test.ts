// src/features/prototypes/schemas/apiConfigSchemas.test.ts

import { describe, it, expect } from 'vitest';
import { apiConfigSchema, httpMethodSchema } from './apiConfigSchemas';

describe('apiConfigSchemas', () => {
  describe('httpMethodSchema', () => {
    it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])('should accept %s', (method) => {
      expect(httpMethodSchema.safeParse(method).success).toBe(true);
    });

    it('should reject invalid method', () => {
      expect(httpMethodSchema.safeParse('INVALID').success).toBe(false);
      expect(httpMethodSchema.safeParse('').success).toBe(false);
    });
  });

  describe('apiConfigSchema', () => {
    const validConfig = {
      name: 'getUsers',
      url: 'https://api.example.com/users',
      method: 'GET' as const,
      headers: {},
      isMock: false,
      mockStatusCode: 200,
      mockDelayMs: 0,
    };

    it('should accept valid config', () => {
      const result = apiConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should accept config with all optional fields', () => {
      const result = apiConfigSchema.safeParse({
        ...validConfig,
        headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
        isMock: true,
        mockResponse: { users: [] },
        mockStatusCode: 404,
        mockDelayMs: 500,
      });
      expect(result.success).toBe(true);
    });

    describe('name validation', () => {
      it('should reject empty name', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, name: '' });
        expect(result.success).toBe(false);
      });

      it('should reject name starting with a number', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, name: '1endpoint' });
        expect(result.success).toBe(false);
      });

      it('should reject name with spaces', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, name: 'my endpoint' });
        expect(result.success).toBe(false);
      });

      it('should accept name with letters, numbers, hyphens, underscores', () => {
        expect(apiConfigSchema.safeParse({ ...validConfig, name: 'get-users' }).success).toBe(true);
        expect(apiConfigSchema.safeParse({ ...validConfig, name: 'get_users_v2' }).success).toBe(true);
        expect(apiConfigSchema.safeParse({ ...validConfig, name: 'getUsersV2' }).success).toBe(true);
      });

      it('should reject name longer than 100 characters', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, name: 'a'.repeat(101) });
        expect(result.success).toBe(false);
      });

      it('should accept name with exactly 100 characters', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, name: 'a'.repeat(100) });
        expect(result.success).toBe(true);
      });
    });

    describe('url validation', () => {
      it('should reject invalid URL', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, url: 'not-a-url' });
        expect(result.success).toBe(false);
      });

      it('should accept valid HTTPS URL', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, url: 'https://api.example.com/v1' });
        expect(result.success).toBe(true);
      });

      it('should accept valid HTTP URL', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, url: 'http://localhost:3000/api' });
        expect(result.success).toBe(true);
      });
    });

    describe('mockStatusCode validation', () => {
      it('should reject status code below 100', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, mockStatusCode: 99 });
        expect(result.success).toBe(false);
      });

      it('should reject status code above 599', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, mockStatusCode: 600 });
        expect(result.success).toBe(false);
      });

      it('should accept valid status codes', () => {
        expect(apiConfigSchema.safeParse({ ...validConfig, mockStatusCode: 200 }).success).toBe(true);
        expect(apiConfigSchema.safeParse({ ...validConfig, mockStatusCode: 404 }).success).toBe(true);
        expect(apiConfigSchema.safeParse({ ...validConfig, mockStatusCode: 500 }).success).toBe(true);
      });

      it('should default to 200', () => {
        const result = apiConfigSchema.safeParse({ name: 'test', url: 'https://api.test.com', method: 'GET' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.mockStatusCode).toBe(200);
        }
      });
    });

    describe('mockDelayMs validation', () => {
      it('should reject negative delay', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, mockDelayMs: -1 });
        expect(result.success).toBe(false);
      });

      it('should reject delay above 10000', () => {
        const result = apiConfigSchema.safeParse({ ...validConfig, mockDelayMs: 10001 });
        expect(result.success).toBe(false);
      });

      it('should accept valid delay values', () => {
        expect(apiConfigSchema.safeParse({ ...validConfig, mockDelayMs: 0 }).success).toBe(true);
        expect(apiConfigSchema.safeParse({ ...validConfig, mockDelayMs: 5000 }).success).toBe(true);
        expect(apiConfigSchema.safeParse({ ...validConfig, mockDelayMs: 10000 }).success).toBe(true);
      });

      it('should default to 0', () => {
        const result = apiConfigSchema.safeParse({ name: 'test', url: 'https://api.test.com', method: 'GET' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.mockDelayMs).toBe(0);
        }
      });
    });

    describe('defaults', () => {
      it('should apply defaults for optional fields', () => {
        const result = apiConfigSchema.safeParse({
          name: 'test',
          url: 'https://api.test.com',
          method: 'GET',
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.headers).toEqual({});
          expect(result.data.isMock).toBe(false);
          expect(result.data.mockStatusCode).toBe(200);
          expect(result.data.mockDelayMs).toBe(0);
        }
      });
    });
  });
});
