import { describe, it, expect } from 'vitest';
import { ROUTES, isProtectedRoute, isAdminRoute, REDIRECT_AFTER_LOGIN_KEY } from './routeConstants';

describe('ROUTES', () => {
  it('should have all public routes defined', () => {
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.REGISTER).toBe('/register');
    expect(ROUTES.FORGOT_PASSWORD).toBe('/forgot-password');
    expect(ROUTES.RESET_PASSWORD).toBe('/reset-password');
  });

  it('should have all protected user routes defined', () => {
    expect(ROUTES.DASHBOARD).toBe('/dashboard');
    expect(ROUTES.IDEAS).toBe('/ideas');
    expect(ROUTES.IDEA_DETAIL).toBe('/ideas/:id');
    expect(ROUTES.NEW_IDEA).toBe('/ideas/new');
    expect(ROUTES.PRD_BUILDER).toBe('/prd/:id');
    expect(ROUTES.PROTOTYPE).toBe('/prototype/:id');
  });

  it('should have all admin routes defined', () => {
    expect(ROUTES.ADMIN_DASHBOARD).toBe('/admin');
    expect(ROUTES.ADMIN_IDEAS).toBe('/admin/ideas');
    expect(ROUTES.ADMIN_USERS).toBe('/admin/users');
    expect(ROUTES.ADMIN_ANALYTICS).toBe('/admin/analytics');
  });

  it('should have error routes defined', () => {
    expect(ROUTES.NOT_AUTHORIZED).toBe('/not-authorized');
  });
});

describe('isProtectedRoute', () => {
  it('should return false for public routes', () => {
    expect(isProtectedRoute('/login')).toBe(false);
    expect(isProtectedRoute('/register')).toBe(false);
    expect(isProtectedRoute('/forgot-password')).toBe(false);
    expect(isProtectedRoute('/reset-password')).toBe(false);
  });

  it('should return true for protected routes', () => {
    expect(isProtectedRoute('/dashboard')).toBe(true);
    expect(isProtectedRoute('/ideas')).toBe(true);
    expect(isProtectedRoute('/ideas/123')).toBe(true);
    expect(isProtectedRoute('/admin')).toBe(true);
    expect(isProtectedRoute('/not-authorized')).toBe(true);
  });

  it('should handle paths with query parameters', () => {
    expect(isProtectedRoute('/login?redirect=dashboard')).toBe(false);
    expect(isProtectedRoute('/dashboard?tab=overview')).toBe(true);
  });

  it('should handle paths with trailing slashes', () => {
    expect(isProtectedRoute('/login/')).toBe(false);
    expect(isProtectedRoute('/dashboard/')).toBe(true);
  });
});

describe('isAdminRoute', () => {
  it('should return true for admin routes', () => {
    expect(isAdminRoute('/admin')).toBe(true);
    expect(isAdminRoute('/admin/ideas')).toBe(true);
    expect(isAdminRoute('/admin/users')).toBe(true);
    expect(isAdminRoute('/admin/analytics')).toBe(true);
  });

  it('should return false for non-admin routes', () => {
    expect(isAdminRoute('/login')).toBe(false);
    expect(isAdminRoute('/dashboard')).toBe(false);
    expect(isAdminRoute('/ideas')).toBe(false);
    expect(isAdminRoute('/not-authorized')).toBe(false);
  });

  it('should handle paths with query parameters', () => {
    expect(isAdminRoute('/admin?filter=pending')).toBe(true);
    expect(isAdminRoute('/dashboard?admin=true')).toBe(false);
  });

  it('should handle paths with trailing slashes', () => {
    expect(isAdminRoute('/admin/')).toBe(true);
    expect(isAdminRoute('/admin/users/')).toBe(true);
  });
});

describe('REDIRECT_AFTER_LOGIN_KEY', () => {
  it('should be a defined string constant', () => {
    expect(REDIRECT_AFTER_LOGIN_KEY).toBe('redirectAfterLogin');
  });
});
