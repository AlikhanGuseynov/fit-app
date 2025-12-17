import type { Exercise } from './exercise'

export interface WorkoutPlan {
  id: string
  user_id: string
  name: string
  goal?: string | null
  is_active?: boolean | null
  workouts?: Workout[]
}

export interface Workout {
  id: string
  user_id: string
  plan_id?: string | null
  name: string
  day_index?: number | null
  focus?: string | null
  workout_exercises?: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  user_id: string
  workout_id: string
  exercise_id: string
  sets?: number | null
  reps?: number | null
  rest_seconds?: number | null
  notes?: string | null
  exercises?: Exercise
}
