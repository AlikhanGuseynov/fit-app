export type UserGoal = 'lose_weight' | 'maintain' | 'gain_muscle'

export type ActivityLevel = 'low' | 'moderate' | 'high'

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

export type Gender = 'male' | 'female' | 'other'

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string | null
  age?: number | null
  gender?: Gender | null
  height_cm?: number | null
  weight_kg?: number | null
  goal?: UserGoal | null
  activity_level?: ActivityLevel | null
  fitness_level?: FitnessLevel | null
  workouts_per_week?: number | null
  equipment?: string[] | null
  onboarding_completed?: boolean | null
  bmr?: number | null
  tdee?: number | null
  target_calories?: number | null
  created_at?: string
  updated_at?: string
}
