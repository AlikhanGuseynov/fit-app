import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { workoutsClient } from '@/lib/localDatabase'
import { useAuthStore } from '@/store/authStore'
import type { Workout, WorkoutExercise } from '@/types/workout'

const fetchWorkout = async (userId: string, workoutId: string): Promise<Workout | null> => {
  return workoutsClient.getWorkout(userId, workoutId)
}

type SetsState = Record<string, boolean[]>

const buildInitialSets = (exercises: WorkoutExercise[] | undefined): SetsState => {
  if (!exercises) return {}
  return exercises.reduce<SetsState>((acc, item) => {
    const length = item.sets ?? 0
    acc[item.id] = Array.from({ length }, () => false)
    return acc
  }, {})
}

const WorkoutSessionPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [setsState, setSetsState] = useState<SetsState>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['session-workout', id, user?.id],
    queryFn: () => fetchWorkout(user!.id, id ?? ''),
    enabled: Boolean(user?.id && id),
    onSuccess: (workout) => {
      if (workout?.workout_exercises) {
        setSetsState((prev) => (Object.keys(prev).length ? prev : buildInitialSets(workout.workout_exercises)))
      }
    },
  })

  const startSession = async () => {
    if (!user || !id) return
    setErrorMessage(null)
    try {
      const session = await workoutsClient.startSession(user.id, id)
      setSessionId(session.id)
      setStatusMessage('Сессия началась. Отмечайте подходы по мере выполнения.')
    } catch (startError) {
      console.error('[FitFlow] Failed to start session', startError)
      setErrorMessage('Не удалось создать сессию. Проверьте локальное хранилище.')
    }
  }

  const toggleSet = async (exerciseId: string, index: number) => {
    if (!sessionId || !user || !data) return
    setErrorMessage(null)

    setSetsState((prev) => {
      const next = { ...prev }
      const arr = [...(next[exerciseId] ?? [])]
      arr[index] = !arr[index]
      next[exerciseId] = arr
      return next
    })

    try {
      const targetExercise = data.workout_exercises?.find((item) => item.id === exerciseId)
      await workoutsClient.recordSessionExercise({
        id: `${sessionId}-${exerciseId}-${index + 1}`,
        session_id: sessionId,
        exercise_id: targetExercise?.exercise_id ?? exerciseId,
        set_number: index + 1,
        reps_completed: targetExercise?.reps ?? null,
        completed: setsState[exerciseId]?.[index] ? false : true,
      })
    } catch (upsertCatch) {
      console.error('[FitFlow] Failed to track set', upsertCatch)
      setErrorMessage('Не удалось сохранить подход. Проверьте локальное хранилище.')
    }
  }

  const finishSession = async () => {
    if (!sessionId || !user) return
    setErrorMessage(null)
    try {
      await workoutsClient.finishSession(sessionId)
      setStatusMessage('Сессия завершена! Отличная работа.')
    } catch (finishError) {
      console.error('[FitFlow] Failed to finish session', finishError)
      setErrorMessage('Не удалось завершить сессию. Попробуйте ещё раз.')
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
          <CardDescription>Войдите, чтобы начать тренировку.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Текущая тренировка</p>
          <h1 className="text-3xl font-bold tracking-tight">{data?.name ?? 'Тренировка'}</h1>
          <p className="text-muted-foreground">{data?.focus ?? 'Фокус не указан'}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/app/workouts/${id}`}>К деталям</Link>
          </Button>
          <Button onClick={sessionId ? finishSession : startSession}>
            {sessionId ? 'Завершить' : 'Начать'}
          </Button>
        </div>
      </div>

      {statusMessage && <p className="text-sm text-emerald-600">{statusMessage}</p>}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      {isLoading && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Загружаем упражнения...</CardTitle>
            <CardDescription>Получаем тренировку из локального хранилища.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Не удалось загрузить тренировку</CardTitle>
            <CardDescription className="text-destructive">
              {error.message || 'Проверьте локальные данные.'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && data && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Подходы</CardTitle>
            <CardDescription>Отмечайте выполненные подходы по каждому упражнению.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.workout_exercises?.map((item) => (
              <div key={item.id} className="space-y-2 rounded-lg border border-border/70 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">{item.exercises?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.reps ? `${item.reps} повторов` : 'Повторы не указаны'} ·{' '}
                      {item.rest_seconds ? `Отдых ${item.rest_seconds} сек` : 'Отдых не указан'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Подходов: {item.sets ?? 0}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(setsState[item.id] ?? []).map((isDone, index) => (
                    <Button
                      key={index}
                      variant={isDone ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSet(item.id, index)}
                    >
                      {isDone ? '✓' : index + 1}
                    </Button>
                  ))}
                  {(setsState[item.id] ?? []).length === 0 && (
                    <span className="text-sm text-muted-foreground">Нет подходов для отслеживания</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WorkoutSessionPage
