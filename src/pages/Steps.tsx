import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Footprints, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { StepsTracking } from '@/types/tracking'

const fetchStepsForDate = async (userId: string, date: string): Promise<StepsTracking | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('steps_tracking')
    .select('id,user_id,date,steps,distance_km,calories_burned,updated_at')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data as StepsTracking | null
}

const fetchRecentSteps = async (userId: string): Promise<StepsTracking[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('steps_tracking')
    .select('id,user_id,date,steps,distance_km,calories_burned,updated_at')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(7)

  if (error) throw error
  return data as StepsTracking[]
}

const StepsPage = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [stepsValue, setStepsValue] = useState('10000')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    data: daily,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['steps-tracking', user?.id, today],
    queryFn: () => fetchStepsForDate(user!.id, today),
    enabled: Boolean(user?.id),
  })

  const { data: history } = useQuery({
    queryKey: ['steps-history', user?.id],
    queryFn: () => fetchRecentSteps(user!.id),
    enabled: Boolean(user?.id),
  })

  const upsertSteps = useMutation({
    mutationFn: async () => {
      if (!user) return
      const steps = Number(stepsValue) || 0
      const distance = Number((steps * 0.0008).toFixed(2))
      const calories = Number((distance * 55).toFixed(2))
      const supabase = getSupabaseClient()
      const { error: upsertError } = await supabase.from('steps_tracking').upsert({
        user_id: user.id,
        date: today,
        steps,
        distance_km: distance,
        calories_burned: calories,
      })
      if (upsertError) throw upsertError
    },
    onSuccess: async () => {
      setErrorMessage(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['steps-tracking', user?.id, today] }),
        queryClient.invalidateQueries({ queryKey: ['steps-history', user?.id] }),
      ])
    },
    onError: (mutationError: Error) => setErrorMessage(mutationError.message),
  })

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Нужна авторизация</CardTitle>
          <CardDescription>Войдите, чтобы отслеживать шаги.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const distance = daily?.distance_km ?? 0
  const calories = daily?.calories_burned ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Шаги</p>
        <h1 className="text-3xl font-bold tracking-tight">Активность за день</h1>
        <p className="text-muted-foreground">Вводите шаги вручную, автоматически считаем дистанцию и калории.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Сегодня</CardTitle>
              <CardDescription>Сохраните шаги и получите расчёты.</CardDescription>
            </div>
            <Footprints className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Шаги</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={stepsValue}
                  onChange={(event) => setStepsValue(event.target.value)}
                />
                <Button onClick={() => upsertSteps.mutate()} disabled={upsertSteps.isPending}>
                  Сохранить
                </Button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                icon={<Navigation className="h-4 w-4 text-primary" />}
                title="Шаги"
                value={`${daily?.steps ?? 0}`}
                helper="за сегодня"
              />
              <MetricCard
                icon={<MapPin className="h-4 w-4 text-primary" />}
                title="Дистанция"
                value={`${distance?.toFixed(2)} км`}
                helper="оценка"
              />
              <MetricCard
                icon={<Navigation className="h-4 w-4 text-primary" />}
                title="Калории"
                value={`${calories?.toFixed(0)} ккал`}
                helper="расчет"
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            {error && (
              <p className="text-sm text-destructive">{error.message || 'Не удалось загрузить данные по шагам.'}</p>
            )}
            {isLoading && <p className="text-sm text-muted-foreground">Загружаем данные...</p>}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>История</CardTitle>
              <CardDescription>Последние записи по шагам.</CardDescription>
            </div>
            <MapPin className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!history?.length && <p className="text-muted-foreground">Пока нет записей.</p>}
            {history?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.steps} шагов</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{(item.distance_km ?? 0).toFixed(2)} км</p>
                  <p>{(item.calories_burned ?? 0).toFixed(0)} ккал</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type MetricCardProps = {
  icon: React.ReactNode
  title: string
  value: string
  helper: string
}

const MetricCard = ({ icon, title, value, helper }: MetricCardProps) => (
  <div className="rounded-xl border border-border/60 bg-background/60 p-3">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <p className="font-medium text-foreground">{title}</p>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{helper}</p>
  </div>
)

export default StepsPage
