import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Droplets, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { WaterTracking } from '@/types/tracking'

const fetchWaterForDate = async (userId: string, date: string): Promise<WaterTracking | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('water_tracking')
    .select('id,user_id,date,total_ml,goal_ml,updated_at')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data as WaterTracking | null
}

const fetchRecentWater = async (userId: string): Promise<WaterTracking[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('water_tracking')
    .select('id,user_id,date,total_ml,goal_ml,updated_at')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(7)

  if (error) throw error
  return data as WaterTracking[]
}

const WaterPage = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [goalOverride, setGoalOverride] = useState<number | null>(null)
  const [amount, setAmount] = useState('250')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    data: daily,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['water-tracking', user?.id, today],
    queryFn: () => fetchWaterForDate(user!.id, today),
    enabled: Boolean(user?.id),
  })

  const { data: recent } = useQuery({
    queryKey: ['water-history', user?.id],
    queryFn: () => fetchRecentWater(user!.id),
    enabled: Boolean(user?.id),
  })

  const addWater = useMutation({
    mutationFn: async (value: number) => {
      if (!user) return
      const supabase = getSupabaseClient()
      const currentTotal = daily?.total_ml ?? 0
      const goal = goalOverride ?? daily?.goal_ml ?? 2000
      const { error: upsertError } = await supabase.from('water_tracking').upsert({
        user_id: user.id,
        date: today,
        total_ml: currentTotal + value,
        goal_ml: goal,
      })
      if (upsertError) throw upsertError
    },
    onSuccess: async () => {
      setErrorMessage(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['water-tracking', user?.id, today] }),
        queryClient.invalidateQueries({ queryKey: ['water-history', user?.id] }),
      ])
    },
    onError: (mutationError: Error) => setErrorMessage(mutationError.message),
  })

  const updateGoal = useMutation({
    mutationFn: async () => {
      if (!user) return
      const supabase = getSupabaseClient()
      const goal = goalOverride ?? daily?.goal_ml ?? 2000
      const { error: upsertError } = await supabase.from('water_tracking').upsert({
        user_id: user.id,
        date: today,
        total_ml: daily?.total_ml ?? 0,
        goal_ml: goal,
      })
      if (upsertError) throw upsertError
    },
    onSuccess: async () => {
      setErrorMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['water-tracking', user?.id, today] })
    },
    onError: (mutationError: Error) => setErrorMessage(mutationError.message),
  })

  const goal = goalOverride ?? daily?.goal_ml ?? 2000
  const progress = goal > 0 ? Math.min(((daily?.total_ml ?? 0) / goal) * 100, 100) : 0

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Нужна авторизация</CardTitle>
          <CardDescription>Войдите, чтобы отслеживать воду.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Вода</p>
        <h1 className="text-3xl font-bold tracking-tight">Гидратация за день</h1>
        <p className="text-muted-foreground">Быстро добавляйте воду и смотрите прогресс.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Прогресс дня</CardTitle>
              <CardDescription>Цель и добавленные миллилитры за сегодня.</CardDescription>
            </div>
            <Droplets className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 sm:items-center">
            <div className="flex flex-col items-center justify-center">
              <div
                className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-border/70"
                style={{
                  background: `conic-gradient(#22c55e ${progress * 3.6}deg, rgba(226,232,240,0.6) 0deg)`,
                }}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{daily?.total_ml ?? 0} мл</p>
                  <p className="text-xs text-muted-foreground">из {goal} мл</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Быстрое добавление</p>
                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 1000].map((value) => (
                    <Button key={value} variant="secondary" onClick={() => addWater.mutate(value)}>
                      +{value} мл
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Свой объём</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="50"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <Button onClick={() => addWater.mutate(Number(amount) || 0)} disabled={addWater.isPending}>
                    Добавить
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Цель на день</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="500"
                    value={goal}
                    onChange={(event) => setGoalOverride(Number(event.target.value) || 0)}
                  />
                  <Button variant="outline" onClick={() => updateGoal.mutate()} disabled={updateGoal.isPending}>
                    Сохранить цель
                  </Button>
                </div>
              </div>
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
              {error && (
                <p className="text-sm text-destructive">{error.message || 'Не удалось загрузить данные по воде.'}</p>
              )}
              {isLoading && <p className="text-sm text-muted-foreground">Загружаем данные...</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>История</CardTitle>
              <CardDescription>Последние дни и прогресс по цели.</CardDescription>
            </div>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!recent?.length && <p className="text-muted-foreground">Пока нет записей. Добавьте воду сегодня.</p>}
            {recent?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.total_ml} мл</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Цель {item.goal_ml} мл · {Math.min((item.total_ml / item.goal_ml) * 100, 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WaterPage
