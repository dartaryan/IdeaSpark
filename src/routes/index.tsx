// Routes configuration
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AuthenticatedLayout } from '../components/layouts/AuthenticatedLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <div className="min-h-screen bg-base-200 flex items-center justify-center"><div className="card bg-base-100 shadow-xl p-8"><h1 className="text-2xl font-bold">Password Reset - Story 1.7</h1></div></div>,
  },
  {
    // Authenticated routes - wrapped with AuthenticatedLayout
    element: <AuthenticatedLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
]);
