/**
 * Centralized route path constants
 * All route paths should be defined here and imported throughout the app
 */

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Protected routes (user)
  DASHBOARD: '/dashboard',
  IDEAS: '/ideas',
  IDEA_DETAIL: '/ideas/:id',
  NEW_IDEA: '/ideas/new',
  PRD_BUILDER: '/prd/:id',
  PROTOTYPE: '/prototype/:id',

  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_IDEAS: '/admin/ideas',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',

  // Error routes
  NOT_AUTHORIZED: '/not-authorized',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES: RoutePath[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

/**
 * Check if a route path requires authentication
 * @param path - The route path to check
 * @returns true if the route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  // Normalize path (remove query params and trailing slashes)
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';
  return !PUBLIC_ROUTES.includes(normalizedPath as RoutePath);
}

/**
 * Check if a route path requires admin role
 * @param path - The route path to check
 * @returns true if the route requires admin role
 */
export function isAdminRoute(path: string): boolean {
  // Normalize path (remove query params and trailing slashes)
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';
  return normalizedPath.startsWith('/admin');
}

/**
 * Session storage key for storing redirect URL after login
 */
export const REDIRECT_AFTER_LOGIN_KEY = 'redirectAfterLogin';
