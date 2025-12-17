import { describe, expect, it } from 'vitest'
import { calculateBmr, calculateTargetCalories, calculateTdee } from '../nutrition'

describe('nutrition calculations', () => {
  it('calculates BMR for different genders', () => {
    expect(calculateBmr('male', 80, 180, 30)).toBeCloseTo(88.36 + 13.4 * 80 + 4.8 * 180 - 5.7 * 30)
    expect(calculateBmr('female', 65, 170, 28)).toBeCloseTo(447.6 + 9.2 * 65 + 3.1 * 170 - 4.3 * 28)
    expect(calculateBmr('other', 70, 175, 32)).toBeCloseTo(370 + 21.6 * 70)
  })

  it('calculates TDEE using activity multiplier', () => {
    expect(calculateTdee(1700, 'low')).toBe(2040)
    expect(calculateTdee(1700, 'moderate')).toBe(2635)
    expect(calculateTdee(1700, 'high')).toBe(2933)
  })

  it('calculates target calories based on goal', () => {
    expect(calculateTargetCalories(2500, 'lose_weight')).toBe(2000)
    expect(calculateTargetCalories(2500, 'maintain')).toBe(2500)
    expect(calculateTargetCalories(2500, 'gain_muscle')).toBe(2800)
  })
})
