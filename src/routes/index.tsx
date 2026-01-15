// Routes configuration
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotAuthorizedPage } from '../pages/NotAuthorizedPage';
import { AuthenticatedLayout } from '../components/layouts/AuthenticatedLayout';
import { ROUTES } from './routeConstants';

export const router = createBrowserRouter([
  // Root redirect to login
  {
    path: '/',
    element: <App />,
  },

  // Public routes (no authentication required)
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPasswordPage />,
  },

  // Error routes
  {
    path: ROUTES.NOT_AUTHORIZED,
    element: <NotAuthorizedPage />,
  },

  // Protected routes - wrapped with AuthenticatedLayout
  // AuthenticatedLayout handles auth check, loading state, and header
  {
    element: <AuthenticatedLayout />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      // Future user routes (Story 2.x)
      // { path: ROUTES.IDEAS, element: <IdeasPage /> },
      // { path: ROUTES.IDEA_DETAIL, element: <IdeaDetailPage /> },
      // { path: ROUTES.NEW_IDEA, element: <NewIdeaPage /> },
      // { path: ROUTES.PRD_BUILDER, element: <PrdBuilderPage /> },
      // { path: ROUTES.PROTOTYPE, element: <PrototypePage /> },
    ],
  },

  // Admin routes - will need AdminRoute wrapper when pages are created
  // {
  //   element: <AuthenticatedLayout />,
  //   children: [
  //     { path: ROUTES.ADMIN_DASHBOARD, element: <AdminRoute><AdminDashboardPage /></AdminRoute> },
  //     { path: ROUTES.ADMIN_IDEAS, element: <AdminRoute><AdminIdeasPage /></AdminRoute> },
  //     { path: ROUTES.ADMIN_USERS, element: <AdminRoute><AdminUsersPage /></AdminRoute> },
  //     { path: ROUTES.ADMIN_ANALYTICS, element: <AdminRoute><AdminAnalyticsPage /></AdminRoute> },
  //   ],
  // },

  // Catch-all redirect to login
  {
    path: '*',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
]);

// Re-export route utilities
export { ProtectedRoute } from './ProtectedRoute';
export { AdminRoute } from './AdminRoute';
export { ROUTES, isProtectedRoute, isAdminRoute, REDIRECT_AFTER_LOGIN_KEY } from './routeConstants';
