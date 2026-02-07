// src/features/prototypes/schemas/passwordSchemas.ts

import { z } from 'zod';

/**
 * Zod schema for password validation
 * - Min 8 characters (OWASP recommendation)
 * - Max 72 characters (bcrypt limitation)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

/** Password strength levels */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * Calculate password strength based on length and character diversity.
 *
 * - Weak: < 8 characters or all one character type
 * - Medium: 8+ characters with 2+ character types
 * - Strong: 12+ characters with 3+ character types
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak';

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const charTypes = [hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length;

  if (password.length >= 12 && charTypes >= 3) return 'strong';
  if (charTypes >= 2) return 'medium';
  return 'weak';
}

/** DaisyUI badge classes for each strength level */
export const strengthBadgeClass: Record<PasswordStrength, string> = {
  weak: 'badge-error',
  medium: 'badge-warning',
  strong: 'badge-success',
};

/** Human-readable labels for each strength level */
export const strengthLabel: Record<PasswordStrength, string> = {
  weak: 'Weak',
  medium: 'Medium',
  strong: 'Strong',
};
