// src/features/prototypes/services/passwordService.test.ts

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './passwordService';

describe('passwordService', () => {
  describe('hashPassword', () => {
    it('should return a bcrypt hash string', async () => {
      const hash = await hashPassword('TestPassword123');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      // Bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should produce a 60-character hash', async () => {
      const hash = await hashPassword('MySecurePass!');
      expect(hash.length).toBe(60);
    });

    it('should produce different hashes for the same password (due to salt)', async () => {
      const hash1 = await hashPassword('SamePassword');
      const hash2 = await hashPassword('SamePassword');
      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty-ish but valid passwords', async () => {
      // bcryptjs allows short strings; validation is at schema level
      const hash = await hashPassword('12345678');
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await hashPassword('CorrectPassword');
      const isMatch = await verifyPassword('WrongPassword', hash);
      expect(isMatch).toBe(false);
    });

    it('should handle special characters in passwords', async () => {
      const password = 'P@$$w0rd!#%^&*()';
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should handle unicode characters in passwords', async () => {
      const password = 'Pässwörd123';
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should be case-sensitive', async () => {
      const hash = await hashPassword('Password123');
      const isMatch = await verifyPassword('password123', hash);
      expect(isMatch).toBe(false);
    });
  });
});
