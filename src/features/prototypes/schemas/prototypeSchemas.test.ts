// src/features/prototypes/schemas/prototypeSchemas.test.ts

import { describe, it, expect } from 'vitest';
import {
  createPrototypeSchema,
  createVersionSchema,
  updatePrototypeSchema,
  prototypeStatusSchema,
} from './prototypeSchemas';

describe('prototypeSchemas', () => {
  describe('prototypeStatusSchema', () => {
    it('should accept valid status values', () => {
      expect(prototypeStatusSchema.parse('generating')).toBe('generating');
      expect(prototypeStatusSchema.parse('ready')).toBe('ready');
      expect(prototypeStatusSchema.parse('failed')).toBe('failed');
    });

    it('should reject invalid status values', () => {
      expect(() => prototypeStatusSchema.parse('invalid')).toThrow();
      expect(() => prototypeStatusSchema.parse('')).toThrow();
    });
  });

  describe('createPrototypeSchema', () => {
    const validInput = {
      prdId: '550e8400-e29b-41d4-a716-446655440000',
      ideaId: '550e8400-e29b-41d4-a716-446655440001',
    };

    it('should accept valid input with required fields only', () => {
      const result = createPrototypeSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should accept valid input with optional fields', () => {
      const inputWithOptionals = {
        ...validInput,
        url: 'https://example.com/prototype',
        code: 'const App = () => <div>Hello</div>',
        status: 'ready' as const,
      };
      const result = createPrototypeSchema.parse(inputWithOptionals);
      expect(result).toEqual(inputWithOptionals);
    });

    it('should reject invalid prdId UUID', () => {
      expect(() =>
        createPrototypeSchema.parse({
          ...validInput,
          prdId: 'not-a-uuid',
        })
      ).toThrow('Invalid PRD ID');
    });

    it('should reject invalid ideaId UUID', () => {
      expect(() =>
        createPrototypeSchema.parse({
          ...validInput,
          ideaId: 'not-a-uuid',
        })
      ).toThrow('Invalid Idea ID');
    });

    it('should reject invalid url format', () => {
      expect(() =>
        createPrototypeSchema.parse({
          ...validInput,
          url: 'not-a-url',
        })
      ).toThrow();
    });

    it('should reject invalid status value', () => {
      expect(() =>
        createPrototypeSchema.parse({
          ...validInput,
          status: 'invalid',
        })
      ).toThrow();
    });

    it('should reject missing required fields', () => {
      expect(() =>
        createPrototypeSchema.parse({
          prdId: validInput.prdId,
        })
      ).toThrow();

      expect(() =>
        createPrototypeSchema.parse({
          ideaId: validInput.ideaId,
        })
      ).toThrow();
    });
  });

  describe('createVersionSchema', () => {
    const validInput = {
      prdId: '550e8400-e29b-41d4-a716-446655440000',
      ideaId: '550e8400-e29b-41d4-a716-446655440001',
      refinementPrompt: 'Make the button bigger',
    };

    it('should accept valid input with required fields', () => {
      const result = createVersionSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should accept valid input with optional fields', () => {
      const inputWithOptionals = {
        ...validInput,
        url: 'https://example.com/prototype/v2',
        code: 'const App = () => <div>Updated</div>',
      };
      const result = createVersionSchema.parse(inputWithOptionals);
      expect(result).toEqual(inputWithOptionals);
    });

    it('should reject empty refinementPrompt', () => {
      expect(() =>
        createVersionSchema.parse({
          ...validInput,
          refinementPrompt: '',
        })
      ).toThrow('Refinement prompt is required');
    });

    it('should reject missing refinementPrompt', () => {
      expect(() =>
        createVersionSchema.parse({
          prdId: validInput.prdId,
          ideaId: validInput.ideaId,
        })
      ).toThrow();
    });

    it('should reject invalid prdId UUID', () => {
      expect(() =>
        createVersionSchema.parse({
          ...validInput,
          prdId: 'not-a-uuid',
        })
      ).toThrow('Invalid PRD ID');
    });

    it('should reject invalid ideaId UUID', () => {
      expect(() =>
        createVersionSchema.parse({
          ...validInput,
          ideaId: 'not-a-uuid',
        })
      ).toThrow('Invalid Idea ID');
    });

    it('should reject invalid url format', () => {
      expect(() =>
        createVersionSchema.parse({
          ...validInput,
          url: 'not-a-url',
        })
      ).toThrow();
    });
  });

  describe('updatePrototypeSchema', () => {
    it('should accept valid input with one field', () => {
      expect(updatePrototypeSchema.parse({ url: 'https://example.com' })).toEqual({
        url: 'https://example.com',
      });

      expect(updatePrototypeSchema.parse({ code: 'const x = 1;' })).toEqual({
        code: 'const x = 1;',
      });

      expect(updatePrototypeSchema.parse({ status: 'ready' })).toEqual({
        status: 'ready',
      });
    });

    it('should accept valid input with all fields', () => {
      const input = {
        url: 'https://example.com',
        code: 'const x = 1;',
        status: 'ready' as const,
      };
      expect(updatePrototypeSchema.parse(input)).toEqual(input);
    });

    it('should accept empty object', () => {
      expect(updatePrototypeSchema.parse({})).toEqual({});
    });

    it('should reject invalid url format', () => {
      expect(() =>
        updatePrototypeSchema.parse({
          url: 'not-a-url',
        })
      ).toThrow();
    });

    it('should reject invalid status value', () => {
      expect(() =>
        updatePrototypeSchema.parse({
          status: 'invalid',
        })
      ).toThrow();
    });
  });
});
