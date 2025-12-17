import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { workoutsClient } from '@/lib/localDatabase'
import { useAuthStore } from '@/store/authStore'
import type { WorkoutPlan } from '@/types/workout'

const fetchActivePlan = async (userId: string): Promise<WorkoutPlan | null> => {
  return workoutsClient.getActivePlan(userId)
}

const WorkoutsPlanPage = () => {
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['active-plan', user?.id],
    queryFn: () => fetchActivePlan(user!.id),
    enabled: Boolean(user?.id),
  })

  const sortedWorkouts = useMemo(() => {
    if (!data?.workouts) return []
    return [...data.workouts].sort((a, b) => (a.day_index ?? 0) - (b.day_index ?? 0))
  }, [data])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
          <CardDescription>Войдите, чтобы увидеть ваш текущий план тренировок.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Текущий план</p>
          <h1 className="text-3xl font-bold tracking-tight">Ваши тренировки</h1>
          <p className="text-muted-foreground">Посмотрите, что запланировано на неделю.</p>
        </div>
        <Button asChild variant="ghost">
          <Link to="/app/dashboard">К дашборду</Link>
        </Button>
      </div>

      {isLoading && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Загружаем план...</CardTitle>
            <CardDescription>Получаем данные из локального хранилища.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Не удалось загрузить план</CardTitle>
            <CardDescription className="text-destructive">
              {error.message || 'Проверьте локальные данные.'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && !data && (
        <Card>
          <CardHeader>
            <CardTitle>План не найден</CardTitle>
            <CardDescription>
              Создайте план в онбординге или сгенерируйте его через Edge Function.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && data && (
        <div className="space-y-4">
          <Card className="border-border/70 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>{data.name}</CardTitle>
              <CardDescription>{data.goal ?? 'Цель не указана'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {sortedWorkouts.map((workout) => (
                  <Card key={workout.id} className="border-border/70 bg-background/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <CardDescription>
                        День {workout.day_index ?? '—'} · {workout.focus ?? 'Без фокуса'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Подробнее о тренировке</span>
                      <Button asChild size="sm" variant="secondary">
                        <Link to={`/app/workouts/${workout.id}`}>Открыть</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default WorkoutsPlanPage
