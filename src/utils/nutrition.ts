import type { ActivityLevel, Gender, UserGoal } from '@/types/profile'

const activityMultipliers: Record<ActivityLevel, number> = {
  low: 1.2,
  moderate: 1.55,
  high: 1.725,
}

export const calculateBmr = (gender: Gender, weight: number, height: number, age: number) => {
  if (gender === 'male') {
    return 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
  }
  if (gender === 'female') {
    return 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age
  }
  return 370 + 21.6 * weight
}

export const calculateTdee = (bmr: number, activity: ActivityLevel) => Math.round(bmr * activityMultipliers[activity])

export const calculateTargetCalories = (tdee: number, goal: UserGoal) => {
  if (goal === 'lose_weight') return Math.max(1200, Math.round(tdee - 500))
  if (goal === 'gain_muscle') return Math.round(tdee + 300)
  return Math.round(tdee)
}
