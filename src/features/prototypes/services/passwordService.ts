// src/features/prototypes/services/passwordService.ts

import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcryptjs.
 * Uses 10 salt rounds (industry standard, OWASP recommended).
 *
 * @param password - Plaintext password to hash
 * @returns Bcrypt hash string (60 characters)
 * @throws Error if hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcryptjs.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plaintext password against a bcrypt hash.
 *
 * @param password - Plaintext password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns true if password matches, false otherwise
 * @throws Error if verification fails
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isMatch = await bcryptjs.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to verify password');
  }
}

export const passwordService = {
  hashPassword,
  verifyPassword,
};
