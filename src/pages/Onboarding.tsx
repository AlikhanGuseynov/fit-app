import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type {
  ActivityLevel,
  Gender,
  UserGoal,
  UserProfile,
} from '@/types/profile'

const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Введите имя'),
  age: z.coerce.number().int().min(10).max(120),
  gender: z.enum(['male', 'female', 'other']),
  height_cm: z.coerce.number().min(100).max(250),
  weight_kg: z.coerce.number().min(30).max(250),
  goal: z.enum(['lose_weight', 'maintain', 'gain_muscle']),
  activity_level: z.enum(['low', 'moderate', 'high']),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  workouts_per_week: z.coerce.number().int().min(1).max(14),
  equipment: z.array(z.string()).optional(),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

const activityMultipliers: Record<ActivityLevel, number> = {
  low: 1.2,
  moderate: 1.55,
  high: 1.725,
}

const equipmentOptions = [
  { value: 'bodyweight', label: 'Собственный вес' },
  { value: 'dumbbells', label: 'Гантели' },
  { value: 'barbell', label: 'Штанга' },
  { value: 'kettlebell', label: 'Гиря' },
  { value: 'resistance_bands', label: 'Эластичные ленты' },
  { value: 'machines', label: 'Тренажёры' },
]

const calculateBmr = (gender: Gender, weight: number, height: number, age: number) => {
  if (gender === 'male') {
    return 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age
  }
  if (gender === 'female') {
    return 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age
  }
  // fallback formula
  return 370 + 21.6 * weight
}

const calculateTdee = (bmr: number, activity: ActivityLevel) => Math.round(bmr * activityMultipliers[activity])

const calculateTargetCalories = (tdee: number, goal: UserGoal) => {
  if (goal === 'lose_weight') return Math.max(1200, Math.round(tdee - 500))
  if (goal === 'gain_muscle') return Math.round(tdee + 300)
  return Math.round(tdee)
}

const steps = [
  { id: 1, title: 'Персональные данные', description: 'Помогают рассчитать базовые метрики' },
  { id: 2, title: 'Цели и активность', description: 'Настроим план под ваш образ жизни' },
  { id: 3, title: 'Привычки и инвентарь', description: 'Выберем доступные тренировки' },
]

const fieldsByStep: Record<number, Array<keyof OnboardingValues>> = {
  1: ['full_name', 'age', 'gender', 'height_cm', 'weight_kg'],
  2: ['goal', 'activity_level', 'fitness_level'],
  3: ['workouts_per_week', 'equipment'],
}

const OnboardingPage = () => {
  const navigate = useNavigate()
  const { user, profile, setProfile } = useAuthStore()
  const [step, setStep] = useState(1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const defaultValues: OnboardingValues = useMemo(
    () => ({
      full_name: profile?.full_name ?? '',
      age: profile?.age ?? 25,
      gender: profile?.gender ?? 'other',
      height_cm: profile?.height_cm ?? 170,
      weight_kg: profile?.weight_kg ?? 70,
      goal: profile?.goal ?? 'maintain',
      activity_level: profile?.activity_level ?? 'moderate',
      fitness_level: profile?.fitness_level ?? 'beginner',
      workouts_per_week: profile?.workouts_per_week ?? 3,
      equipment: profile?.equipment ?? ['bodyweight'],
    }),
    [profile],
  )

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const handleNext = async () => {
    const isValid = await trigger(fieldsByStep[step])
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (values: OnboardingValues) => {
    if (!user) {
      setErrorMessage('Нужна авторизация, чтобы пройти онбординг.')
      return
    }

    setErrorMessage(null)

    try {
      const supabase = getSupabaseClient()
      const bmr = calculateBmr(values.gender, values.weight_kg, values.height_cm, values.age)
      const tdee = calculateTdee(bmr, values.activity_level)
      const targetCalories = calculateTargetCalories(tdee, values.goal)

      const payload: UserProfile = {
        id: profile?.id ?? user.id,
        user_id: user.id,
        ...values,
        equipment: values.equipment ?? [],
        bmr: Math.round(bmr),
        tdee,
        target_calories: targetCalories,
        onboarding_completed: true,
      }

      const { data, error } = await supabase
        .from('users_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select('*')
        .single()

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setProfile(data as UserProfile)
      navigate('/app/dashboard')
    } catch (error) {
      console.error('[FitFlow] Failed to complete onboarding', error)
      setErrorMessage('Не удалось сохранить профиль. Проверьте настройки Supabase.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-3xl border-border/80 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Онбординг</CardTitle>
          <CardDescription>Ответьте на вопросы, чтобы мы подготовили персональный план.</CardDescription>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {steps.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    step === item.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {item.id}
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="full_name">Имя</Label>
                  <Input id="full_name" placeholder="Как к вам обращаться?" {...register('full_name')} />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Возраст</Label>
                  <Input id="age" type="number" min={10} max={120} {...register('age')} />
                  {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Пол</Label>
                  <select
                    id="gender"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('gender')}
                  >
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                    <option value="other">Другой</option>
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height_cm">Рост (см)</Label>
                  <Input id="height_cm" type="number" min={100} max={250} {...register('height_cm')} />
                  {errors.height_cm && (
                    <p className="text-sm text-destructive">{errors.height_cm.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Вес (кг)</Label>
                  <Input id="weight_kg" type="number" min={30} max={250} {...register('weight_kg')} />
                  {errors.weight_kg && (
                    <p className="text-sm text-destructive">{errors.weight_kg.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="goal">Цель</Label>
                  <select
                    id="goal"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('goal')}
                  >
                    <option value="lose_weight">Похудение</option>
                    <option value="maintain">Поддержание</option>
                    <option value="gain_muscle">Набор мышц</option>
                  </select>
                  {errors.goal && <p className="text-sm text-destructive">{errors.goal.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity_level">Активность</Label>
                  <select
                    id="activity_level"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('activity_level')}
                  >
                    <option value="low">Низкая</option>
                    <option value="moderate">Средняя</option>
                    <option value="high">Высокая</option>
                  </select>
                  {errors.activity_level && (
                    <p className="text-sm text-destructive">{errors.activity_level.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fitness_level">Уровень подготовки</Label>
                  <select
                    id="fitness_level"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register('fitness_level')}
                  >
                    <option value="beginner">Новичок</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                  {errors.fitness_level && (
                    <p className="text-sm text-destructive">{errors.fitness_level.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workouts_per_week">Тренировок в неделю</Label>
                  <Input
                    id="workouts_per_week"
                    type="number"
                    min={1}
                    max={14}
                    {...register('workouts_per_week')}
                  />
                  {errors.workouts_per_week && (
                    <p className="text-sm text-destructive">{errors.workouts_per_week.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Доступное оборудование</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {equipmentOptions.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm shadow-sm"
                      >
                        <input
                          type="checkbox"
                          value={item.value}
                          {...register('equipment')}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.equipment && (
                    <p className="text-sm text-destructive">{errors.equipment.message}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                  <p className="font-medium text-foreground">Что будет сохранено</p>
                  <p className="text-muted-foreground">
                    Мы рассчитаем BMR, TDEE и целевые калории, чтобы настроить ваш план питания и
                    тренировок.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Шаг {step} из {steps.length}: {steps[step - 1]?.title}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {step > 1 && (
                <Button type="button" variant="ghost" onClick={handleBack}>
                  Назад
                </Button>
              )}
              {step < steps.length && (
                <Button type="button" onClick={handleNext}>
                  Далее
                </Button>
              )}
              {step === steps.length && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Сохраняем...' : 'Сгенерировать план'}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default OnboardingPage
