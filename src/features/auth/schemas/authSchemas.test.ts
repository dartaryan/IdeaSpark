import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './authSchemas';

describe('registerSchema', () => {
  it('should validate a valid registration form', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject an empty email', () => {
    const data = {
      email: '',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required');
    }
  });

  it('should reject an invalid email format', () => {
    const data = {
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please enter a valid email');
    }
  });

  it('should reject a password shorter than 8 characters', () => {
    const data = {
      email: 'test@example.com',
      password: 'short',
      confirmPassword: 'short',
    };

    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
    }
  });

  it('should reject mismatched passwords', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    };

    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match');
    }
  });

  it('should reject empty confirm password', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: '',
    };

    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please confirm your password');
    }
  });
});

describe('loginSchema', () => {
  it('should validate a valid login form', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject an empty email', () => {
    const data = {
      email: '',
      password: 'password123',
    };

    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required');
    }
  });

  it('should reject an empty password', () => {
    const data = {
      email: 'test@example.com',
      password: '',
    };

    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required');
    }
  });
});

describe('forgotPasswordSchema', () => {
  it('should validate a valid email', () => {
    const validData = {
      email: 'test@example.com',
    };

    const result = forgotPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject an empty email', () => {
    const data = {
      email: '',
    };

    const result = forgotPasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email is required');
    }
  });

  it('should reject an invalid email format', () => {
    const data = {
      email: 'invalid-email',
    };

    const result = forgotPasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please enter a valid email address');
    }
  });
});

describe('resetPasswordSchema', () => {
  it('should validate a valid password reset form', () => {
    const validData = {
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    };

    const result = resetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject a password shorter than 8 characters', () => {
    const data = {
      password: 'short',
      confirmPassword: 'short',
    };

    const result = resetPasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
    }
  });

  it('should reject mismatched passwords', () => {
    const data = {
      password: 'newpassword123',
      confirmPassword: 'differentpassword',
    };

    const result = resetPasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match');
    }
  });

  it('should reject empty confirm password', () => {
    const data = {
      password: 'newpassword123',
      confirmPassword: '',
    };

    const result = resetPasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please confirm your password');
    }
  });

  it('should validate exactly 8 character password', () => {
    const data = {
      password: '12345678',
      confirmPassword: '12345678',
    };

    const result = resetPasswordSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
