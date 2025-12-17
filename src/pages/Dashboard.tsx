import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, CheckCircle, Clock, Droplets, Flame, Footprints } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface WeeklySummary {
  completed: number
  total: number
}

const fetchTodayWorkout = async (userId: string) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workouts')
    .select('id,name,focus')
    .eq('user_id', userId)
    .order('day_index')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

const fetchWeeklySummary = async (userId: string): Promise<WeeklySummary> => {
  const supabase = getSupabaseClient()
  const start = new Date()
  start.setDate(start.getDate() - 7)
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id,completed')
    .eq('user_id', userId)
    .gte('start_time', start.toISOString())

  if (error) throw error
  const completed = data.filter((item) => item.completed).length
  return { completed, total: data.length }
}

const fetchUpcomingWorkouts = async (userId: string) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('workouts')
    .select('id,name,focus,day_index')
    .eq('user_id', userId)
    .order('day_index')
    .limit(4)
  if (error) throw error
  return data
}

const DashboardPage = () => {
  const { user } = useAuthStore()

  const {
    data: todayWorkout,
    isLoading: todayLoading,
    error: todayError,
  } = useQuery({
    queryKey: ['today-workout', user?.id],
    queryFn: () => fetchTodayWorkout(user!.id),
    enabled: Boolean(user?.id),
  })

  const {
    data: weekly,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useQuery({
    queryKey: ['weekly-summary', user?.id],
    queryFn: () => fetchWeeklySummary(user!.id),
    enabled: Boolean(user?.id),
  })

  const {
    data: upcoming,
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useQuery({
    queryKey: ['upcoming-workouts', user?.id],
    queryFn: () => fetchUpcomingWorkouts(user!.id),
    enabled: Boolean(user?.id),
  })

  const quickActions = useMemo(
    () => [
      { label: 'План тренировок', href: '/app/workouts/plan' },
      { label: 'Библиотека упражнений', href: '/app/exercises' },
      { label: 'Отслеживание прогресса', href: '/app/progress' },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Добро пожаловать в FitFlow</p>
        <h1 className="text-3xl font-bold tracking-tight">Сегодняшний прогресс</h1>
        <p className="text-muted-foreground">Следите за ключевыми метриками и продолжайте движение.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {todayLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <StatCard
              title="Шаги"
              value="—"
              helper="Цель 10 000"
              icon={<Footprints className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Вода"
              value="—"
              helper="Добавьте стакан воды"
              icon={<Droplets className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Калории"
              value="—"
              helper="Следите за балансом"
              icon={<Flame className="h-5 w-5 text-primary" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Сегодняшняя тренировка</CardTitle>
              <CardDescription>Следующий шаг вашего плана</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/app/workouts/plan">К плану</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayLoading && <Skeleton className="h-16 w-full" />}
            {todayError && (
              <p className="text-sm text-destructive" role="alert">
                {todayError.message || 'Не удалось получить тренировку.'}
              </p>
            )}
            {!todayLoading && !todayError && todayWorkout ? (
              <div className="rounded-lg border border-border/70 bg-background/60 p-4">
                <p className="text-lg font-semibold text-foreground">{todayWorkout.name}</p>
                <p className="text-sm text-muted-foreground">{todayWorkout.focus ?? 'Без фокуса'}</p>
                <div className="mt-3 flex gap-2">
                  <Button asChild>
                    <Link to={`/app/workouts/${todayWorkout.id}`}>Детали</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/app/workouts/${todayWorkout.id}/session`}>Начать</Link>
                  </Button>
                </div>
              </div>
            ) : null}
            {!todayLoading && !todayError && !todayWorkout && (
              <p className="text-sm text-muted-foreground">Пока нет тренировки на сегодня.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Переходите к часто используемым разделам.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Button key={action.href} asChild variant="secondary" className="justify-start">
                <Link to={action.href}>{action.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Результаты недели</CardTitle>
              <CardDescription>Выполненные и запланированные сессии за 7 дней.</CardDescription>
            </div>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {weeklyLoading && <Skeleton className="h-6 w-40" />}
            {weeklyError && (
              <p className="text-sm text-destructive" role="alert">
                {weeklyError.message || 'Не удалось получить статистику.'}
              </p>
            )}
            {!weeklyLoading && !weeklyError && weekly && (
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{weekly.completed}</p>
                <p className="text-sm text-muted-foreground">из {weekly.total} завершено</p>
              </div>
            )}
            {!weeklyLoading && !weeklyError && !weekly && (
              <p className="text-sm text-muted-foreground">Нет данных за эту неделю.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ближайшие тренировки</CardTitle>
              <CardDescription>Подготовьтесь заранее и спланируйте день.</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingLoading && <Skeleton className="h-20 w-full" />}
            {upcomingError && (
              <p className="text-sm text-destructive" role="alert">
                {upcomingError.message || 'Не удалось получить список тренировок.'}
              </p>
            )}
            {!upcomingLoading && !upcomingError && upcoming?.length ? (
              upcoming.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      День {item.day_index ?? '—'} · {item.focus ?? 'Без фокуса'}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/app/workouts/${item.id}`}>Открыть</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Пока нет запланированных тренировок.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  helper: string
  icon: React.ReactNode
}

const StatCard = ({ title, value, helper, icon }: StatCardProps) => (
  <Card className="border-border/70 bg-card/80 backdrop-blur">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className="space-y-1">
      <p className="text-2xl font-bold">{value}</p>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowUpRight className="h-4 w-4 text-primary" />
        {helper}
      </div>
    </CardContent>
  </Card>
)

export default DashboardPage
