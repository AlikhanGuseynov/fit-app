import type { Exercise } from '@/types/exercise'
import type { ActivityLevel, FitnessLevel, Gender, UserGoal, UserProfile } from '@/types/profile'
import type {
  CaloriesTracking,
  NotificationSettings,
  StepsTracking,
  WaterTracking,
} from '@/types/tracking'
import type { Workout, WorkoutPlan } from '@/types/workout'

export type AuthUser = {
  id: string
  email: string
}

export type WorkoutSessionEntry = {
  id: string
  user_id: string
  workout_id: string
  start_time: string
  end_time?: string
  completed?: boolean
}

export type SessionExerciseEntry = {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  reps_completed?: number | null
  completed: boolean
}

export type WeightEntry = {
  id: string
  user_id: string
  recorded_at: string
  weight_kg: number
  note?: string | null
}

type StoredUser = AuthUser & {
  password: string
  created_at: string
}

type LocalDatabase = {
  users: StoredUser[]
  profiles: UserProfile[]
  steps: StepsTracking[]
  water: WaterTracking[]
  calories: CaloriesTracking[]
  notifications: NotificationSettings[]
  workoutPlans: Array<WorkoutPlan & { workouts?: Workout[] }>
  workouts: Workout[]
  exercises: Exercise[]
  workoutSessions: WorkoutSessionEntry[]
  sessionExercises: SessionExerciseEntry[]
  weightHistory: WeightEntry[]
}

const DB_KEY = 'fitflow-local-db'
const SESSION_KEY = 'fitflow-session'

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(16)}`

const seedExercises = (): Exercise[] => [
  {
    id: 'ex-pushups',
    name: 'Отжимания',
    category: 'Грудь',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    muscle_groups: ['Грудь', 'Трицепс', 'Плечи'],
    description: 'Базовое упражнение для верхней части тела.',
  },
  {
    id: 'ex-squats',
    name: 'Приседания',
    category: 'Ноги',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    muscle_groups: ['Квадрицепсы', 'Ягодицы'],
    description: 'Классическое упражнение для ног и кора.',
  },
  {
    id: 'ex-plank',
    name: 'Планка',
    category: 'Кор',
    difficulty: 'beginner',
    equipment: ['bodyweight'],
    muscle_groups: ['Кор', 'Поясница'],
    description: 'Статическое упражнение для укрепления кора.',
  },
]

const buildWorkout = (
  id: string,
  name: string,
  focus: string,
  dayIndex: number,
  exercises: Exercise[],
): Workout => ({
  id,
  user_id: 'user-demo',
  plan_id: 'plan-demo',
  name,
  focus,
  day_index: dayIndex,
  workout_exercises: [
    {
      id: `${id}-we-1`,
      user_id: 'user-demo',
      workout_id: id,
      exercise_id: exercises[0].id,
      sets: 3,
      reps: 12,
      rest_seconds: 60,
      notes: null,
      exercises: exercises[0],
    },
    {
      id: `${id}-we-2`,
      user_id: 'user-demo',
      workout_id: id,
      exercise_id: exercises[1].id,
      sets: 3,
      reps: 15,
      rest_seconds: 75,
      notes: null,
      exercises: exercises[1],
    },
    {
      id: `${id}-we-3`,
      user_id: 'user-demo',
      workout_id: id,
      exercise_id: exercises[2].id,
      sets: 2,
      reps: 45,
      rest_seconds: 45,
      notes: 'Держите корпус в напряжении',
      exercises: exercises[2],
    },
  ],
})

const seedDatabase = (): LocalDatabase => {
  const now = new Date().toISOString()
  const exercises = seedExercises()
  const workouts = [
    buildWorkout('workout-demo-1', 'Быстрый старт', 'Всё тело', 1, exercises),
    buildWorkout('workout-demo-2', 'Фокус на ноги', 'Ноги', 3, exercises),
  ]

  const plan: WorkoutPlan & { workouts: Workout[] } = {
    id: 'plan-demo',
    user_id: 'user-demo',
    name: 'Домашний план',
    goal: 'Поддержание формы',
    is_active: true,
    workouts,
  }

  const profile: UserProfile = {
    id: 'profile-demo',
    user_id: 'user-demo',
    full_name: 'Demo Пользователь',
    age: 28,
    gender: 'other',
    height_cm: 172,
    weight_kg: 70,
    goal: 'maintain',
    activity_level: 'moderate',
    fitness_level: 'beginner',
    workouts_per_week: 3,
    equipment: ['bodyweight'],
    onboarding_completed: true,
    bmr: 1550,
    tdee: 2300,
    target_calories: 2200,
    last_plan_id: plan.id,
    created_at: now,
    updated_at: now,
  }

  return {
    users: [
      {
        id: 'user-demo',
        email: 'demo@fitflow.app',
        password: 'fitflow123',
        created_at: now,
      },
    ],
    profiles: [profile],
    steps: [
      {
        id: createId('steps'),
        user_id: 'user-demo',
        date: now.slice(0, 10),
        steps: 4500,
        distance_km: 3.6,
        calories_burned: 180,
        updated_at: now,
      },
    ],
    water: [
      {
        id: createId('water'),
        user_id: 'user-demo',
        date: now.slice(0, 10),
        total_ml: 1200,
        goal_ml: 2000,
        updated_at: now,
      },
    ],
    calories: [
      {
        id: createId('calories'),
        user_id: 'user-demo',
        date: now.slice(0, 10),
        meals: [
          { type: 'breakfast', time: '08:30', items: [{ name: 'Овсянка', calories: 350 }] },
          { type: 'lunch', time: '13:00', items: [{ name: 'Курица и рис', calories: 650 }] },
        ],
        total_calories: 1000,
        calories_burned: 200,
        updated_at: now,
      },
    ],
    notifications: [
      {
        id: 'notif-demo',
        user_id: 'user-demo',
        push_enabled: true,
        email_enabled: true,
        reminders_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
        preferred_times: ['08:00', '18:00'],
        updated_at: now,
      },
    ],
    workoutPlans: [plan],
    workouts,
    exercises,
    workoutSessions: [],
    sessionExercises: [],
    weightHistory: [
      {
        id: createId('weight'),
        user_id: 'user-demo',
        recorded_at: now.slice(0, 10),
        weight_kg: 70,
        note: 'Стартовая точка',
      },
    ],
  }
}

const readDb = (): LocalDatabase => {
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const seeded = seedDatabase()
    localStorage.setItem(DB_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    return JSON.parse(raw) as LocalDatabase
  } catch (error) {
    console.warn('[FitFlow] Не удалось прочитать локальную базу, создаем заново.', error)
    const seeded = seedDatabase()
    localStorage.setItem(DB_KEY, JSON.stringify(seeded))
    return seeded
  }
}

const writeDb = (next: LocalDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(next))
}

const updateDb = (updater: (db: LocalDatabase) => LocalDatabase) => {
  const db = readDb()
  const next = updater(db)
  writeDb(next)
  return next
}

let authSubscribers: Array<(user: AuthUser | null) => void> = []

const notifyAuth = (user: AuthUser | null) => {
  authSubscribers.forEach((callback) => callback(user))
}

const getUserBySession = (): AuthUser | null => {
  const userId = localStorage.getItem(SESSION_KEY)
  if (!userId) return null
  const db = readDb()
  const user = db.users.find((item) => item.id === userId)
  return user ? { id: user.id, email: user.email } : null
}

export const authClient = {
  async getSession(): Promise<{ user: AuthUser | null }> {
    return { user: getUserBySession() }
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser }> {
    const db = readDb()
    const existing = db.users.find((user) => user.email === email && user.password === password)
    if (!existing) {
      throw new Error('Неверный email или пароль')
    }
    localStorage.setItem(SESSION_KEY, existing.id)
    const user = { id: existing.id, email: existing.email }
    notifyAuth(user)
    return { user }
  },

  async signUp(email: string, password: string): Promise<{ user: AuthUser }> {
    const db = readDb()
    const exists = db.users.some((user) => user.email === email)
    if (exists) {
      throw new Error('Пользователь с таким email уже существует')
    }
    const user: StoredUser = {
      id: createId('user'),
      email,
      password,
      created_at: new Date().toISOString(),
    }
    const next = { ...db, users: [...db.users, user] }
    writeDb(next)
    localStorage.setItem(SESSION_KEY, user.id)
    notifyAuth({ id: user.id, email: user.email })
    return { user: { id: user.id, email: user.email } }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY)
    notifyAuth(null)
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    authSubscribers.push(callback)
    return () => {
      authSubscribers = authSubscribers.filter((item) => item !== callback)
    }
  },
}

const upsertById = <T extends { id: string }>(items: T[], payload: T) => {
  const index = items.findIndex((item) => item.id === payload.id)
  if (index === -1) return [...items, payload]
  const next = [...items]
  next[index] = payload
  return next
}

export const profileClient = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const db = readDb()
    return db.profiles.find((item) => item.user_id === userId) ?? null
  },

  async upsertProfile(profile: UserProfile): Promise<UserProfile> {
    const now = new Date().toISOString()
    const payload: UserProfile = {
      ...profile,
      id: profile.id || createId('profile'),
      updated_at: now,
      created_at: profile.created_at ?? now,
    }

    const db = updateDb((current) => ({ ...current, profiles: upsertById(current.profiles, payload) }))
    return db.profiles.find((item) => item.id === payload.id) as UserProfile
  },
}

export const activityClient = {
  async getStepsForDate(userId: string, date: string): Promise<StepsTracking | null> {
    const db = readDb()
    return db.steps.find((item) => item.user_id === userId && item.date === date) ?? null
  },

  async getRecentSteps(userId: string): Promise<StepsTracking[]> {
    const db = readDb()
    return db.steps
      .filter((item) => item.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
  },

  async upsertSteps(payload: Omit<StepsTracking, 'id'> & { id?: string }): Promise<void> {
    updateDb((db) => {
      const existing = db.steps.find((item) => item.user_id === payload.user_id && item.date === payload.date)
      const nextEntry: StepsTracking = {
        id: existing?.id ?? createId('steps'),
        ...existing,
        ...payload,
        updated_at: new Date().toISOString(),
      }
      const filtered = db.steps.filter((item) => item.id !== nextEntry.id)
      return { ...db, steps: [...filtered, nextEntry] }
    })
  },

  async getWaterForDate(userId: string, date: string): Promise<WaterTracking | null> {
    const db = readDb()
    return db.water.find((item) => item.user_id === userId && item.date === date) ?? null
  },

  async getRecentWater(userId: string): Promise<WaterTracking[]> {
    const db = readDb()
    return db.water
      .filter((item) => item.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
  },

  async upsertWater(payload: Omit<WaterTracking, 'id'> & { id?: string }): Promise<void> {
    updateDb((db) => {
      const existing = db.water.find((item) => item.user_id === payload.user_id && item.date === payload.date)
      const nextEntry: WaterTracking = {
        id: existing?.id ?? createId('water'),
        ...existing,
        ...payload,
        updated_at: new Date().toISOString(),
      }
      const filtered = db.water.filter((item) => item.id !== nextEntry.id)
      return { ...db, water: [...filtered, nextEntry] }
    })
  },
}

export const nutritionClient = {
  async getCaloriesForDate(userId: string, date: string): Promise<CaloriesTracking | null> {
    const db = readDb()
    return db.calories.find((item) => item.user_id === userId && item.date === date) ?? null
  },

  async getRecentCalories(userId: string): Promise<CaloriesTracking[]> {
    const db = readDb()
    return db.calories
      .filter((item) => item.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
  },

  async upsertCalories(payload: Omit<CaloriesTracking, 'id'> & { id?: string }): Promise<void> {
    updateDb((db) => {
      const existing = db.calories.find((item) => item.user_id === payload.user_id && item.date === payload.date)
      const nextEntry: CaloriesTracking = {
        id: existing?.id ?? createId('calories'),
        ...existing,
        ...payload,
        updated_at: new Date().toISOString(),
      }
      const filtered = db.calories.filter((item) => item.id !== nextEntry.id)
      return { ...db, calories: [...filtered, nextEntry] }
    })
  },
}

export const notificationClient = {
  async getSettings(userId: string): Promise<NotificationSettings | null> {
    const db = readDb()
    return db.notifications.find((item) => item.user_id === userId) ?? null
  },

  async upsertSettings(payload: Omit<NotificationSettings, 'id'> & { id?: string }): Promise<void> {
    updateDb((db) => {
      const existing = db.notifications.find((item) => item.user_id === payload.user_id)
      const nextEntry: NotificationSettings = {
        id: existing?.id ?? createId('notif'),
        ...existing,
        ...payload,
        updated_at: new Date().toISOString(),
      }
      const filtered = db.notifications.filter((item) => item.id !== nextEntry.id)
      return { ...db, notifications: [...filtered, nextEntry] }
    })
  },
}

export const workoutsClient = {
  async getActivePlan(userId: string): Promise<WorkoutPlan | null> {
    const db = readDb()
    const plan = db.workoutPlans.find((item) => item.user_id === userId && item.is_active)
    if (!plan) return null
    const workouts = db.workouts.filter((item) => item.plan_id === plan.id)
    return { ...plan, workouts }
  },

  async ensurePlanForUser(userId: string, goal: UserGoal, activity: ActivityLevel, fitness: FitnessLevel) {
    const db = readDb()
    const existing = db.workoutPlans.find((item) => item.user_id === userId && item.is_active)
    if (existing) return existing.id

    const newPlanId = createId('plan')
    const workouts: Workout[] = seedExercises().map((exercise, index) => {
      const workoutId = createId('workout')
      return {
        id: workoutId,
        user_id: userId,
        plan_id: newPlanId,
        name: `Тренировка ${index + 1}`,
        day_index: index + 1,
        focus: `${goal === 'gain_muscle' ? 'Сила' : 'Баланс'} · ${fitness}`,
        workout_exercises: [
          {
            id: createId('we'),
            user_id: userId,
            workout_id: workoutId,
            exercise_id: exercise.id,
            sets: 3,
            reps: 12,
            rest_seconds: 60,
            notes: null,
            exercises: exercise,
          },
        ],
      }
    })

    const plan: WorkoutPlan & { workouts: Workout[] } = {
      id: newPlanId,
      user_id: userId,
      name: 'Локальный план',
      goal: goal,
      is_active: true,
      workouts,
    }

    updateDb((current) => ({
      ...current,
      workoutPlans: [
        ...current.workoutPlans.map((item) =>
          item.user_id === userId ? { ...item, is_active: false } : item,
        ),
        plan,
      ],
      workouts: [...current.workouts, ...workouts],
    }))

    return plan.id
  },

  async getWorkout(userId: string, workoutId: string): Promise<Workout | null> {
    const db = readDb()
    const workout = db.workouts.find((item) => item.user_id === userId && item.id === workoutId)
    if (!workout) return null
    const enrichExercise = (exerciseId: string) => db.exercises.find((ex) => ex.id === exerciseId)
    const workoutExercises = (workout.workout_exercises ?? []).map((item) => ({
      ...item,
      exercises: item.exercises ?? enrichExercise(item.exercise_id),
    }))
    return { ...workout, workout_exercises: workoutExercises }
  },

  async getUpcomingWorkouts(userId: string): Promise<Workout[]> {
    const db = readDb()
    return db.workouts
      .filter((item) => item.user_id === userId)
      .sort((a, b) => (a.day_index ?? 0) - (b.day_index ?? 0))
      .slice(0, 4)
  },

  async getWorkouts(userId: string): Promise<Workout[]> {
    const db = readDb()
    return db.workouts.filter((item) => item.user_id === userId).sort((a, b) => (a.day_index ?? 0) - (b.day_index ?? 0))
  },

  async startSession(userId: string, workoutId: string): Promise<WorkoutSessionEntry> {
    const session: WorkoutSessionEntry = {
      id: createId('session'),
      user_id: userId,
      workout_id: workoutId,
      start_time: new Date().toISOString(),
      completed: false,
    }

    updateDb((db) => ({ ...db, workoutSessions: [...db.workoutSessions, session] }))
    return session
  },

  async finishSession(sessionId: string): Promise<void> {
    updateDb((db) => ({
      ...db,
      workoutSessions: db.workoutSessions.map((session) =>
        session.id === sessionId
          ? { ...session, completed: true, end_time: new Date().toISOString() }
          : session,
      ),
    }))
  },

  async recordSessionExercise(entry: SessionExerciseEntry): Promise<void> {
    updateDb((db) => ({
      ...db,
      sessionExercises: upsertById(db.sessionExercises, {
        ...entry,
        id: entry.id || createId('session-exercise'),
      }),
    }))
  },

  async getSessionsBetween(userId: string, start: Date, end: Date): Promise<WorkoutSessionEntry[]> {
    const db = readDb()
    return db.workoutSessions.filter((session) => {
      if (session.user_id !== userId) return false
      const startTime = new Date(session.start_time).getTime()
      return startTime >= start.getTime() && startTime <= end.getTime()
    })
  },
}

export const progressClient = {
  async getWeightHistory(userId: string): Promise<WeightEntry[]> {
    const db = readDb()
    return db.weightHistory
      .filter((item) => item.user_id === userId)
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
  },

  async upsertWeightEntry(payload: Omit<WeightEntry, 'id'> & { id?: string }): Promise<void> {
    updateDb((db) => {
      const existing = db.weightHistory.find(
        (item) => item.user_id === payload.user_id && item.recorded_at === payload.recorded_at,
      )

      const nextEntry: WeightEntry = {
        id: existing?.id ?? createId('weight'),
        ...existing,
        ...payload,
      }
      const filtered = db.weightHistory.filter((item) => item.id !== nextEntry.id)
      return { ...db, weightHistory: [...filtered, nextEntry] }
    })
  },
}

export const exercisesClient = {
  async getExercises(): Promise<Exercise[]> {
    const db = readDb()
    return db.exercises
  },

  async getExerciseById(id: string): Promise<Exercise | null> {
    const db = readDb()
    return db.exercises.find((item) => item.id === id) ?? null
  },
}

export const resetLocalState = () => {
  localStorage.removeItem(DB_KEY)
  localStorage.removeItem(SESSION_KEY)
}
