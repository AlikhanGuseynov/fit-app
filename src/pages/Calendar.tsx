import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { Calendar as CalendarIcon, CheckCircle2, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { workoutsClient } from '@/lib/localDatabase'
import { useAuthStore } from '@/store/authStore'

type Workout = {
  id: string
  name: string
  focus?: string | null
  day_index?: number | null
}

type WorkoutSession = {
  id: string
  workout_id: string | null
  start_time: string
  completed: boolean
}

const fetchWorkouts = async (userId: string): Promise<Workout[]> => {
  return workoutsClient.getWorkouts(userId)
}

const fetchSessions = async (userId: string, start: Date, end: Date): Promise<WorkoutSession[]> => {
  return workoutsClient.getSessionsBetween(userId, start, end)
}

const weekdayFromDate = (date: Date) => {
  const day = getDay(date)
  return day === 0 ? 7 : day
}

const CalendarPage = () => {
  const { user } = useAuthStore()
  const [view, setView] = useState<'week' | 'month'>('week')
  const [monthCursor, setMonthCursor] = useState(() => new Date())

  const periodStart =
    view === 'week'
      ? startOfWeek(new Date(), { weekStartsOn: 1 })
      : startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 })
  const periodEnd =
    view === 'week'
      ? endOfWeek(new Date(), { weekStartsOn: 1 })
      : endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 })

  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['workouts-calendar', user?.id],
    queryFn: () => fetchWorkouts(user!.id),
    enabled: Boolean(user?.id),
  })

  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ['workout-sessions', user?.id, periodStart.toISOString(), periodEnd.toISOString()],
    queryFn: () => fetchSessions(user!.id, periodStart, periodEnd),
    enabled: Boolean(user?.id),
  })

  const weekDays = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) }),
    [],
  )

  const monthDays = useMemo(
    () => eachDayOfInterval({ start: periodStart, end: periodEnd }),
    [periodStart, periodEnd],
  )

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>()
    ;(sessions ?? []).forEach((session) => {
      const key = format(new Date(session.start_time), 'yyyy-MM-dd')
      const existing = map.get(key) ?? []
      map.set(key, [...existing, session])
    })
    return map
  }, [sessions])

  const renderDayCard = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd')
    const planned = workouts?.find((workout) => workout.day_index === weekdayFromDate(date))
    const daySessions = sessionsByDay.get(key) ?? []

    return (
      <div key={key} className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/60 p-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{format(date, 'EEEE')}</p>
          <span>{format(date, 'dd MMM')}</span>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/70 p-3">
          <p className="text-sm font-semibold text-foreground">{planned ? planned.name : 'День отдыха'}</p>
          <p className="text-xs text-muted-foreground">{planned?.focus ?? 'Без фокуса'}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <StatusPill label={planned ? 'Запланировано' : 'Нет плана'} type={planned ? 'planned' : 'idle'} />
            {daySessions.length > 0 && <StatusPill label={`Выполнено: ${daySessions.length}`} type="done" />}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Нужна авторизация</CardTitle>
          <CardDescription>Войдите, чтобы увидеть календарь тренировок.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Календарь</p>
          <h1 className="text-3xl font-bold tracking-tight">Тренировки по дням</h1>
          <p className="text-muted-foreground">Просматривайте запланированные и завершенные тренировки.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'week' ? 'default' : 'secondary'} onClick={() => setView('week')}>
            Неделя
          </Button>
          <Button variant={view === 'month' ? 'default' : 'secondary'} onClick={() => setView('month')}>
            Месяц
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{view === 'week' ? 'Неделя' : format(monthCursor, 'LLLL yyyy')}</CardTitle>
            <CardDescription>
              {sessionsLoading || workoutsLoading
                ? 'Загружаем расписание...'
                : 'Индикаторы показывают план и завершенные сессии.'}
            </CardDescription>
          </div>
          <CalendarIcon className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsError && (
            <p className="text-sm text-destructive">
              {sessionsError.message || 'Не удалось получить данные календаря.'}
            </p>
          )}

          {view === 'week' ? (
            <div className="grid gap-3 md:grid-cols-2">{weekDays.map((day) => renderDayCard(day))}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthCursor((current) => addMonths(current, -1))}
                >
                  Предыдущий
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthCursor((current) => addMonths(current, 1))}
                >
                  Следующий
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((label) => (
                  <div key={label} className="text-center">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day) => {
                  const key = format(day, 'yyyy-MM-dd')
                  const planned = workouts?.find((workout) => workout.day_index === weekdayFromDate(day))
                  const daySessions = sessionsByDay.get(key) ?? []
                  const isCurrentMonth = isSameMonth(day, monthCursor)

                  return (
                    <div
                      key={key}
                      className={`flex flex-col gap-1 rounded-xl border border-border/50 bg-background/60 p-3 ${
                        isCurrentMonth ? '' : 'opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{format(day, 'd')}</span>
                        {daySessions.length > 0 && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-foreground">{planned?.name ?? 'Нет плана'}</p>
                        <div className="flex items-center gap-2">
                          <StatusPill label={planned ? 'План' : 'Свободно'} type={planned ? 'planned' : 'idle'} />
                          {daySessions.length > 0 && <StatusPill label={`${daySessions.length} сессии`} type="done" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

type StatusType = 'planned' | 'done' | 'idle'

const pillStyles: Record<StatusType, string> = {
  planned: 'bg-primary/10 text-primary border-primary/30',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  idle: 'bg-muted text-muted-foreground border-border',
}

const StatusPill = ({ label, type }: { label: string; type: StatusType }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${pillStyles[type]}`}>
    {type === 'done' ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
    {label}
  </span>
)

export default CalendarPage
