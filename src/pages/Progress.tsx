import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface WeightEntry {
  id: string
  user_id: string
  recorded_at: string
  weight_kg: number
  note?: string | null
}

const fetchWeightHistory = async (userId: string): Promise<WeightEntry[]> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('weight_history')
    .select('id,user_id,recorded_at,weight_kg,note')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true })

  if (error) throw error
  return data as WeightEntry[]
}

const ProgressPage = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['weight-history', user?.id],
    queryFn: () => fetchWeightHistory(user!.id),
    enabled: Boolean(user?.id),
  })

  const addWeight = useMutation({
    mutationFn: async () => {
      if (!user) return
      const supabase = getSupabaseClient()
      const { error: insertError } = await supabase.from('weight_history').upsert({
        user_id: user.id,
        recorded_at: date,
        weight_kg: Number(weight),
        note: note || null,
      })
      if (insertError) throw insertError
    },
    onSuccess: async () => {
      setWeight('')
      setNote('')
      setErrorMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['weight-history', user?.id] })
    },
    onError: (mutationError: Error) => {
      setErrorMessage(mutationError.message)
    },
  })

  const chartData = useMemo(() => {
    return (data ?? []).map((item) => ({
      date: item.recorded_at,
      weight: item.weight_kg,
    }))
  }, [data])

  const latestWeight = data?.[data.length - 1]?.weight_kg
  const firstWeight = data?.[0]?.weight_kg
  const delta = latestWeight && firstWeight ? latestWeight - firstWeight : null

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
          <CardDescription>Войдите, чтобы отслеживать прогресс веса.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary">Прогресс</p>
        <h1 className="text-3xl font-bold tracking-tight">Вес и динамика</h1>
        <p className="text-muted-foreground">Добавляйте новые записи и смотрите график изменений.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>График веса</CardTitle>
            <CardDescription>Используем данные из таблицы weight_history.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading && <p className="text-sm text-muted-foreground">Загружаем данные...</p>}
            {error && (
              <p className="text-sm text-destructive">
                {error.message || 'Не удалось загрузить историю веса.'}
              </p>
            )}
            {!isLoading && !error && chartData.length === 0 && (
              <p className="text-sm text-muted-foreground">Пока нет записей. Добавьте первую!</p>
            )}
            {!isLoading && !error && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Добавить вес</CardTitle>
            <CardDescription>Запишите новую точку данных.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Вес (кг)</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Комментарий</Label>
              <Input
                id="note"
                placeholder="После тренировки"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button
              className="w-full"
              onClick={() => addWeight.mutate()}
              disabled={addWeight.isPending || !weight}
            >
              {addWeight.isPending ? 'Сохраняем...' : 'Сохранить'}
            </Button>
            {delta !== null && (
              <p className="text-sm text-muted-foreground">
                Изменение с первой записи: {delta > 0 ? '+' : ''}
                {delta.toFixed(1)} кг
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>История</CardTitle>
          <CardDescription>Последние записи веса.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading && <p className="text-sm text-muted-foreground">Загружаем...</p>}
          {error && (
            <p className="text-sm text-destructive">
              {error.message || 'Не удалось загрузить историю веса.'}
            </p>
          )}
          {!isLoading && !error && data?.length === 0 && (
            <p className="text-sm text-muted-foreground">Еще нет записей.</p>
          )}
          {!isLoading &&
            !error &&
            (data ?? []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.weight_kg} кг</p>
                  <p className="text-xs text-muted-foreground">{item.recorded_at}</p>
                </div>
                {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProgressPage
