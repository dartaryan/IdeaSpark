// src/features/prototypes/schemas/passwordSchemas.test.ts

import { describe, it, expect } from 'vitest';
import {
  passwordSchema,
  calculatePasswordStrength,
  strengthBadgeClass,
  strengthLabel,
} from './passwordSchemas';

describe('passwordSchemas', () => {
  describe('passwordSchema', () => {
    it('should accept valid password (8+ characters)', () => {
      const result = passwordSchema.safeParse('ValidPass');
      expect(result.success).toBe(true);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('short');
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues ?? result.error.errors ?? [];
        expect(issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject password longer than 72 characters', () => {
      const longPassword = 'a'.repeat(73);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues ?? result.error.errors ?? [];
        expect(issues[0].message).toContain('at most 72 characters');
      }
    });

    it('should accept password exactly 8 characters', () => {
      const result = passwordSchema.safeParse('12345678');
      expect(result.success).toBe(true);
    });

    it('should accept password exactly 72 characters', () => {
      const result = passwordSchema.safeParse('a'.repeat(72));
      expect(result.success).toBe(true);
    });

    it('should reject empty string', () => {
      const result = passwordSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should return "weak" for passwords shorter than 8 characters', () => {
      expect(calculatePasswordStrength('abc')).toBe('weak');
      expect(calculatePasswordStrength('1234567')).toBe('weak');
    });

    it('should return "weak" for 8+ chars with only one character type', () => {
      expect(calculatePasswordStrength('abcdefgh')).toBe('weak');
      expect(calculatePasswordStrength('ABCDEFGH')).toBe('weak');
      expect(calculatePasswordStrength('12345678')).toBe('weak');
    });

    it('should return "medium" for 8+ chars with 2 character types', () => {
      expect(calculatePasswordStrength('abcDEFGH')).toBe('medium');
      expect(calculatePasswordStrength('abcd1234')).toBe('medium');
      expect(calculatePasswordStrength('ABCD1234')).toBe('medium');
    });

    it('should return "strong" for 12+ chars with 3+ character types', () => {
      expect(calculatePasswordStrength('abcDEF123456')).toBe('strong');
      expect(calculatePasswordStrength('MyP@ssw0rd!!')).toBe('strong');
    });

    it('should return "medium" for 12+ chars with only 2 character types', () => {
      expect(calculatePasswordStrength('abcdefghijkl')).not.toBe('strong');
    });

    it('should handle special characters as a character type', () => {
      expect(calculatePasswordStrength('abc!@#$%^&*(')).toBe('medium');
    });

    it('should return "strong" for complex long passwords', () => {
      expect(calculatePasswordStrength('MyStr0ng!Pass')).toBe('strong');
    });
  });

  describe('strengthBadgeClass', () => {
    it('should map weak to badge-error', () => {
      expect(strengthBadgeClass.weak).toBe('badge-error');
    });

    it('should map medium to badge-warning', () => {
      expect(strengthBadgeClass.medium).toBe('badge-warning');
    });

    it('should map strong to badge-success', () => {
      expect(strengthBadgeClass.strong).toBe('badge-success');
    });
  });

  describe('strengthLabel', () => {
    it('should have human-readable labels', () => {
      expect(strengthLabel.weak).toBe('Weak');
      expect(strengthLabel.medium).toBe('Medium');
      expect(strengthLabel.strong).toBe('Strong');
    });
  });
});
