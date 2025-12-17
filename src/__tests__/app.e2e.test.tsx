import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import DashboardPage from '@/pages/Dashboard'
import OnboardingPage from '@/pages/Onboarding'
import WorkoutSessionPage from '@/pages/WorkoutSession'
import { resetLocalState } from '@/lib/localDatabase'
import { useAuthStore } from '@/store/authStore'

const mockUser = { id: 'user-demo', email: 'demo@fitflow.app' }

const AppShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuthStore()

  useEffect(() => {
    setUser(mockUser)
    if (location.pathname === '/onboarding') {
      navigate('/onboarding')
    }
  }, [location.pathname, navigate, setUser])

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/app/dashboard" element={<DashboardPage />} />
      <Route path="/app/workouts/session/:id" element={<WorkoutSessionPage />} />
    </Routes>
  )
}

const renderWithProviders = (initialPath = '/onboarding') => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[{ pathname: initialPath }]}> 
        <AppShell />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('FitFlow onboarding to workout flow', () => {
  it('completes onboarding and starts a workout session', async () => {
    resetLocalState()
    renderWithProviders()

    await userEvent.type(screen.getByLabelText('Имя'), 'Тестовый Пользователь')
    await userEvent.click(screen.getByRole('button', { name: 'Далее' }))
    await userEvent.click(screen.getByRole('button', { name: 'Далее' }))
    await userEvent.click(screen.getByRole('button', { name: 'Сгенерировать план' }))

    await screen.findByText('Сегодняшний прогресс')

    renderWithProviders('/app/workouts/session/workout-demo-1')

    await waitFor(() => expect(screen.getByText(/Начать тренировку/i)).toBeInTheDocument())
  })
})
