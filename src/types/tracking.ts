export interface WaterTracking {
  id: string
  user_id: string
  date: string
  total_ml: number
  goal_ml: number
  updated_at?: string
}

export interface StepsTracking {
  id: string
  user_id: string
  date: string
  steps: number
  distance_km: number | null
  calories_burned: number | null
  updated_at?: string
}

export interface MealItem {
  name: string
  calories: number
}

export interface MealEntry {
  type: string
  time: string
  items: MealItem[]
}

export interface MealTotals extends MealEntry {
  totals: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
}

export interface CaloriesBreakdown {
  total_calories: number
  calories_burned: number
  balance: number
  meals: MealTotals[]
}

export interface CaloriesTracking {
  id: string
  user_id: string
  date: string
  meals: MealEntry[]
  total_calories: number
  calories_burned: number
  updated_at?: string
}

export interface NotificationSettings {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  reminders_enabled: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  preferred_times: string[]
  updated_at?: string
}
