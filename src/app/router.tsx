import { Navigate, createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import ActivityPage from '@/pages/Activity'
import ExerciseDetailsPage from '@/pages/ExerciseDetails'
import ExercisesPage from '@/pages/Exercises'
import CalendarPage from '@/pages/Calendar'
import DashboardPage from '@/pages/Dashboard'
import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/Login'
import OnboardingPage from '@/pages/Onboarding'
import ProgressPage from '@/pages/Progress'
import RegisterPage from '@/pages/Register'
import ResetPasswordPage from '@/pages/ResetPassword'
import WorkoutDetailsPage from '@/pages/WorkoutDetails'
import WorkoutSessionPage from '@/pages/WorkoutSession'
import WorkoutsPlanPage from '@/pages/WorkoutsPlan'
import WaterPage from '@/pages/Water'
import StepsPage from '@/pages/Steps'
import CaloriesPage from '@/pages/Calories'
import NotificationsPage from '@/pages/Notifications'
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
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'workouts/plan',
        element: <WorkoutsPlanPage />,
      },
      {
        path: 'workouts/:id',
        element: <WorkoutDetailsPage />,
      },
      {
        path: 'workouts/:id/session',
        element: <WorkoutSessionPage />,
      },
      {
        path: 'exercises',
        element: <ExercisesPage />,
      },
      {
        path: 'exercises/:id',
        element: <ExerciseDetailsPage />,
      },
      {
        path: 'progress',
        element: <ProgressPage />,
      },
      {
        path: 'water',
        element: <WaterPage />,
      },
      {
        path: 'steps',
        element: <StepsPage />,
      },
      {
        path: 'calories',
        element: <CaloriesPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
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
