import { Navigate, createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import ActivityPage from '@/pages/Activity'
import DashboardPage from '@/pages/Dashboard'
import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/Login'
import OnboardingPage from '@/pages/Onboarding'
import ProgressPage from '@/pages/Progress'
import RegisterPage from '@/pages/Register'
import ResetPasswordPage from '@/pages/ResetPassword'
import OnboardingRoute from './OnboardingRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/onboarding',
    element: (
      <OnboardingRoute>
        <OnboardingPage />
      </OnboardingRoute>
    ),
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'progress',
        element: <ProgressPage />,
      },
      {
        path: 'activity',
        element: <ActivityPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
