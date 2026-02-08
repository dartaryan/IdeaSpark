// src/features/prototypes/utils/mockTemplates.test.ts

import { describe, it, expect } from 'vitest';
import { mockTemplates } from './mockTemplates';

describe('mockTemplates', () => {
  it('should export an array of templates', () => {
    expect(Array.isArray(mockTemplates)).toBe(true);
    expect(mockTemplates.length).toBeGreaterThan(0);
  });

  it('should include all required template types', () => {
    const ids = mockTemplates.map((t) => t.id);
    expect(ids).toContain('successObject');
    expect(ids).toContain('arrayList');
    expect(ids).toContain('paginatedResponse');
    expect(ids).toContain('errorResponse');
    expect(ids).toContain('emptyResponse');
  });

  it('should have valid JSON content for every template', () => {
    for (const template of mockTemplates) {
      expect(() => JSON.parse(template.content)).not.toThrow();
    }
  });

  it('should have unique ids for every template', () => {
    const ids = mockTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have non-empty name and description for every template', () => {
    for (const template of mockTemplates) {
      expect(template.name.trim().length).toBeGreaterThan(0);
      expect(template.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('successObject template should contain expected fields', () => {
    const template = mockTemplates.find((t) => t.id === 'successObject')!;
    const parsed = JSON.parse(template.content);
    expect(parsed).toHaveProperty('id');
    expect(parsed).toHaveProperty('name');
    expect(parsed).toHaveProperty('status');
  });

  it('arrayList template should be an array', () => {
    const template = mockTemplates.find((t) => t.id === 'arrayList')!;
    const parsed = JSON.parse(template.content);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('paginatedResponse template should contain pagination fields', () => {
    const template = mockTemplates.find((t) => t.id === 'paginatedResponse')!;
    const parsed = JSON.parse(template.content);
    expect(parsed).toHaveProperty('data');
    expect(parsed).toHaveProperty('page');
    expect(parsed).toHaveProperty('pageSize');
    expect(parsed).toHaveProperty('total');
  });

  it('errorResponse template should contain error fields', () => {
    const template = mockTemplates.find((t) => t.id === 'errorResponse')!;
    const parsed = JSON.parse(template.content);
    expect(parsed).toHaveProperty('error');
    expect(parsed).toHaveProperty('message');
    expect(parsed).toHaveProperty('statusCode');
  });

  it('emptyResponse template should be an empty object', () => {
    const template = mockTemplates.find((t) => t.id === 'emptyResponse')!;
    const parsed = JSON.parse(template.content);
    expect(parsed).toEqual({});
  });
});
