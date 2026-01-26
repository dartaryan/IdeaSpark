// Routes configuration
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MyIdeasPage } from '../pages/MyIdeasPage';
import { IdeaDetailPage } from '../pages/IdeaDetailPage';
import { NewIdeaPage } from '../pages/NewIdeaPage';
import { PrdBuilderPage } from '../pages/PrdBuilderPage';
import { PrdViewPage } from '../pages/PrdViewPage';
import { PrototypeViewerPage } from '../pages/PrototypeViewerPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { NotAuthorizedPage } from '../pages/NotAuthorizedPage';
import { AuthenticatedLayout } from '../components/layouts/AuthenticatedLayout';
import { AdminRoute } from './AdminRoute';
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
  // AuthenticatedLayout handles auth check, loading state, sidebar, and header
  {
    element: <AuthenticatedLayout />,
    children: [
      // User routes
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.IDEAS,
        element: <MyIdeasPage />,
      },
      {
        path: ROUTES.IDEA_DETAIL,
        element: <IdeaDetailPage />,
      },
      {
        path: ROUTES.NEW_IDEA,
        element: <NewIdeaPage />,
      },
      {
        path: ROUTES.PRD_BUILDER,
        element: <PrdBuilderPage />,
      },
      {
        path: '/prd/:prdId',
        element: <PrdViewPage />,
      },
      {
        path: '/prototypes/:prototypeId',
        element: <PrototypeViewerPage />,
      },
      // Admin routes - wrapped with AdminRoute for role check
      {
        path: ROUTES.ADMIN_DASHBOARD,
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_ANALYTICS,
        element: (
          <AdminRoute>
            <AnalyticsPage />
          </AdminRoute>
        ),
      },
    ],
  },

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
