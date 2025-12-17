import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { vi } from 'vitest'
import DashboardPage from '@/pages/Dashboard'
import OnboardingPage from '@/pages/Onboarding'
import WorkoutSessionPage from '@/pages/WorkoutSession'
import { useAuthStore } from '@/store/authStore'

const mockUser = { id: 'user-1', email: 'test@example.com' }
let mockProfile = {
  id: 'profile-1',
  user_id: mockUser.id,
  full_name: null,
  age: 25,
  gender: 'male',
  height_cm: 175,
  weight_kg: 75,
  goal: 'maintain',
  activity_level: 'moderate',
  fitness_level: 'beginner',
  workouts_per_week: 3,
  equipment: ['bodyweight'],
  onboarding_completed: false,
}

const mockWorkouts = [
  {
    id: 'workout-1',
    user_id: mockUser.id,
    name: 'Тренировка 1',
    focus: 'full body',
    day_index: 0,
    workout_exercises: [
      {
        id: 'we-1',
        workout_id: 'workout-1',
        exercise_id: 'ex-1',
        sets: 2,
        reps: 10,
        rest_seconds: 60,
        notes: null,
        exercises: { id: 'ex-1', name: 'Отжимания' },
      },
    ],
  },
]

type TablePayload = Record<string, unknown>
type InvokeBody = {
  meals?: Array<{ type: string; time?: string; items: Array<{ name: string; calories: number }> }>
  calories_burned?: number
  profile?: typeof mockProfile
}

const supabaseBuilder = (table: string) => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    gte: () => builder,
    insert: async (payload: TablePayload) => {
      if (table === 'workout_sessions') {
        return { data: { id: 'session-1' }, error: null }
      }
      if (table === 'session_exercises') {
        return { data: payload, error: null }
      }
      return { data: payload, error: null }
    },
    upsert: async (payload: TablePayload) => {
      if (table === 'users_profiles') {
        mockProfile = { ...mockProfile, ...payload }
      }
      return { data: payload, error: null }
    },
    update: async () => ({ data: null, error: null }),
    maybeSingle: async () => {
      if (table === 'users_profiles') return { data: mockProfile, error: null }
      if (table === 'workouts') return { data: mockWorkouts[0], error: null }
      return { data: null, error: null }
    },
    single: async () => {
      if (table === 'users_profiles') return { data: mockProfile, error: null }
      if (table === 'workout_sessions') return { data: { id: 'session-1' }, error: null }
      if (table === 'workouts') return { data: mockWorkouts[0], error: null }
      return { data: null, error: null }
    },
  }
  return builder
}

vi.mock('@/lib/supabase', () => {
  const functionsInvoke = vi.fn(async ({ body }: { body: InvokeBody }) => {
    if (body?.profile) {
      return { data: { plan_id: 'plan-1', workouts: mockWorkouts }, error: null }
    }
    const total = (body?.meals ?? []).reduce(
      (sum, meal) => sum + meal.items.reduce((acc: number, item) => acc + item.calories, 0),
      0,
    )
    return { data: { total_calories: total, calories_burned: body?.calories_burned ?? 0, balance: total, meals: body?.meals ?? [] }, error: null }
  })

  const client = {
    auth: {
      getSession: async () => ({ data: { session: { user: mockUser } }, error: null }),
      onAuthStateChange: (cb: (event: string, session: { user: typeof mockUser } | null) => void) => {
        cb('SIGNED_IN', { user: mockUser })
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      signOut: vi.fn(),
    },
    from: (table: string) => supabaseBuilder(table),
    functions: {
      invoke: functionsInvoke,
    },
  }

  return {
    getSupabaseClient: () => client,
  }
})

const AppShell = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuthStore()

  useEffect(() => {
    setUser(mockUser as unknown as import('@supabase/supabase-js').User)
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
    renderWithProviders()

    await userEvent.type(screen.getByLabelText('Имя'), 'Тестовый Пользователь')
    await userEvent.click(screen.getByRole('button', { name: 'Далее' }))
    await userEvent.click(screen.getByRole('button', { name: 'Далее' }))
    await userEvent.click(screen.getByRole('button', { name: 'Сгенерировать план' }))

    await screen.findByText('Сегодняшний прогресс')

    renderWithProviders('/app/workouts/session/workout-1')

    await waitFor(() => expect(screen.getByText(/Начать тренировку/i)).toBeInTheDocument())
  })
})
