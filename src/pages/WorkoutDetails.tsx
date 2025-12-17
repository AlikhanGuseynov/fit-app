import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Workout } from '@/types/workout'

const fetchWorkout = async (userId: string, workoutId: string): Promise<Workout | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workouts')
    .select(
      'id,name,focus,day_index,workout_exercises(id,sets,reps,rest_seconds,notes,exercises(id,name,category,difficulty,equipment,muscle_groups))',
    )
    .eq('user_id', userId)
    .eq('id', workoutId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as Workout | null
}

const WorkoutDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['workout-details', id, user?.id],
    queryFn: () => fetchWorkout(user!.id, id ?? ''),
    enabled: Boolean(user?.id && id),
  })

  const items = useMemo(() => data?.workout_exercises ?? [], [data?.workout_exercises])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
          <CardDescription>Войдите, чтобы увидеть детали тренировки.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Тренировка</p>
          <h1 className="text-3xl font-bold tracking-tight">{data?.name ?? 'Детали тренировки'}</h1>
          <p className="text-muted-foreground">
            {data?.focus ?? 'Фокус не указан'} · День {data?.day_index ?? '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/app/workouts/plan">Назад к плану</Link>
          </Button>
          <Button asChild>
            <Link to={`/app/workouts/${id}/session`}>Начать тренировку</Link>
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Загружаем тренировку...</CardTitle>
            <CardDescription>Получаем данные из Supabase.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Не удалось загрузить тренировку</CardTitle>
            <CardDescription className="text-destructive">
              {error.message || 'Проверьте соединение с Supabase.'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && !data && (
        <Card>
          <CardHeader>
            <CardTitle>Тренировка не найдена</CardTitle>
            <CardDescription>Проверьте ссылку или вернитесь к плану.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && data && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Упражнения</CardTitle>
            <CardDescription>Сеты, повторы и отдых в рамках этой тренировки.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="border-border/60 bg-background/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.exercises?.name ?? 'Упражнение'}</CardTitle>
                  <CardDescription>
                    {item.exercises?.difficulty ?? '—'} · {item.exercises?.category ?? 'Без категории'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>Подходов: {item.sets ?? '—'}</span>
                  <span>Повторов: {item.reps ?? '—'}</span>
                  <span>Отдых: {item.rest_seconds ? `${item.rest_seconds} сек` : '—'}</span>
                  {item.exercises?.equipment?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {item.exercises.equipment.map((eq) => (
                        <span key={eq} className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                          {eq}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">Добавьте упражнения в эту тренировку.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WorkoutDetailsPage
