import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Flame, PlusCircle, Salad } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { CaloriesBreakdown, CaloriesTracking, MealEntry } from '@/types/tracking'

const fetchCaloriesForDate = async (userId: string, date: string): Promise<CaloriesTracking | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('calories_tracking')
    .select('id,user_id,date,meals,total_calories,calories_burned,updated_at')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data as CaloriesTracking | null
}

const fetchRecentCalories = async (userId: string): Promise<CaloriesTracking[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('calories_tracking')
    .select('id,user_id,date,total_calories,calories_burned')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(7)

  if (error) throw error
  return data as CaloriesTracking[]
}

const CaloriesPage = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [mealType, setMealType] = useState('breakfast')
  const [mealName, setMealName] = useState('')
  const [mealCalories, setMealCalories] = useState('')
  const [mealTime, setMealTime] = useState(() => new Date().toISOString().slice(11, 16))
  const [caloriesBurnedOverride, setCaloriesBurnedOverride] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    data: daily,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['calories-tracking', user?.id, today],
    queryFn: () => fetchCaloriesForDate(user!.id, today),
    enabled: Boolean(user?.id),
  })

  const { data: history } = useQuery({
    queryKey: ['calories-history', user?.id],
    queryFn: () => fetchRecentCalories(user!.id),
    enabled: Boolean(user?.id),
  })

  const caloriesBurned = caloriesBurnedOverride ?? daily?.calories_burned ?? 0

  const calculateTotals = async (meals: MealEntry[], burned: number) => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.functions.invoke<CaloriesBreakdown>('calculate-calories', {
      body: { meals, calories_burned: burned },
    })

    if (error || !data) {
      const fallbackTotal = meals.reduce(
        (sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + item.calories, 0),
        0,
      )
      return { meals, totalCalories: fallbackTotal, burned }
    }

    return {
      meals: data.meals.map(({ type, time, items }) => ({ type, time, items })),
      totalCalories: data.total_calories,
      burned: data.calories_burned,
    }
  }

  const addMeal = useMutation({
    mutationFn: async () => {
      if (!user) return
      const calories = Number(mealCalories) || 0
      if (!mealName || calories <= 0) {
        throw new Error('Введите название и калории блюда.')
      }
      const newMeal: MealEntry = {
        type: mealType,
        time: mealTime,
        items: [{ name: mealName, calories }],
      }
      const meals = [...(daily?.meals ?? []), newMeal]
      const calculation = await calculateTotals(meals, caloriesBurned)
      const supabase = getSupabaseClient()
      const { error: upsertError } = await supabase.from('calories_tracking').upsert({
        user_id: user.id,
        date: today,
        meals: calculation.meals,
        total_calories: calculation.totalCalories,
        calories_burned: calculation.burned,
      })
      if (upsertError) throw upsertError
    },
    onSuccess: async () => {
      setErrorMessage(null)
      setMealName('')
      setMealCalories('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['calories-tracking', user?.id, today] }),
        queryClient.invalidateQueries({ queryKey: ['calories-history', user?.id] }),
      ])
    },
    onError: (mutationError: Error) => setErrorMessage(mutationError.message),
  })

  const saveBurned = useMutation({
    mutationFn: async () => {
      if (!user) return
      const meals = daily?.meals ?? []
      const calculation = await calculateTotals(meals, caloriesBurned)
      const supabase = getSupabaseClient()
      const { error: upsertError } = await supabase.from('calories_tracking').upsert({
        user_id: user.id,
        date: today,
        meals: calculation.meals,
        total_calories: calculation.totalCalories,
        calories_burned: calculation.burned,
      })
      if (upsertError) throw upsertError
    },
    onSuccess: async () => {
      setErrorMessage(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['calories-tracking', user?.id, today] }),
        queryClient.invalidateQueries({ queryKey: ['calories-history', user?.id] }),
      ])
    },
    onError: (mutationError: Error) => setErrorMessage(mutationError.message),
  })

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Нужна авторизация</CardTitle>
          <CardDescription>Войдите, чтобы отслеживать калории.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalCalories = daily?.total_calories ?? 0
  const balance = totalCalories - (daily?.calories_burned ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Калории</p>
          <h1 className="text-3xl font-bold tracking-tight">Рацион и баланс</h1>
          <p className="text-muted-foreground">Добавляйте приёмы пищи, считайте баланс потребления и расхода.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm">
          <Flame className="h-4 w-4 text-primary" />
          Баланс: <span className="font-semibold text-foreground">{balance} ккал</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Добавить приём пищи</CardTitle>
              <CardDescription>Сохраняем в JSONB `meals` и считаем итоговые калории.</CardDescription>
            </div>
            <PlusCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Тип</p>
                <select
                  className="w-full rounded-md border border-border/60 bg-background/80 p-2 text-sm"
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value)}
                >
                  <option value="breakfast">Завтрак</option>
                  <option value="lunch">Обед</option>
                  <option value="dinner">Ужин</option>
                  <option value="snack">Перекус</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Время</p>
                <Input type="time" value={mealTime} onChange={(event) => setMealTime(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Блюдо</p>
                <Input value={mealName} onChange={(event) => setMealName(event.target.value)} placeholder="Овсянка" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Калории</p>
                <Input
                  type="number"
                  min="0"
                  value={mealCalories}
                  onChange={(event) => setMealCalories(event.target.value)}
                  placeholder="350"
                />
              </div>
            </div>
            <Button onClick={() => addMeal.mutate()} disabled={addMeal.isPending}>
              Добавить приём
            </Button>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Калории, сожжённые тренировками</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={caloriesBurned}
                  onChange={(event) => setCaloriesBurnedOverride(Number(event.target.value) || 0)}
                />
                <Button variant="outline" onClick={() => saveBurned.mutate()} disabled={saveBurned.isPending}>
                  Сохранить
                </Button>
              </div>
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            {error && (
              <p className="text-sm text-destructive">{error.message || 'Не удалось загрузить данные по калориям.'}</p>
            )}
            {isLoading && <p className="text-sm text-muted-foreground">Загружаем...</p>}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Список приёмов</CardTitle>
              <CardDescription>Хранится в JSONB `meals`.</CardDescription>
            </div>
            <Salad className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!daily?.meals?.length && <p className="text-muted-foreground">Добавьте первый приём пищи.</p>}
            {daily?.meals?.map((meal, index) => (
              <div
                key={`${meal.type}-${meal.time}-${index}`}
                className="rounded-lg border border-border/60 bg-background/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{meal.type}</p>
                    <p className="text-xs text-muted-foreground">{meal.time}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {meal.items.reduce((sum, item) => sum + item.calories, 0)} ккал
                  </p>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {meal.items.map((item, itemIndex) => (
                    <li key={`${item.name}-${itemIndex}`}>
                      {item.name} · {item.calories} ккал
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>История</CardTitle>
            <CardDescription>Потребление и расход за последние дни.</CardDescription>
          </div>
          <Flame className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!history?.length && <p className="text-muted-foreground">Записи ещё не добавлены.</p>}
          {history?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3"
            >
              <div>
                <p className="font-semibold text-foreground">{item.total_calories} ккал</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Сожжено: {item.calories_burned ?? 0} ккал</p>
                <p>Баланс: {(item.total_calories - (item.calories_burned ?? 0)).toFixed(0)} ккал</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default CaloriesPage
