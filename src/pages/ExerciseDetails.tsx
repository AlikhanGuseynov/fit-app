import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { exercisesClient } from '@/lib/localDatabase'
import type { Exercise } from '@/types/exercise'

const fetchExercise = async (id: string): Promise<Exercise | null> => {
  return exercisesClient.getExerciseById(id)
}

const ExerciseDetailsPage = () => {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => fetchExercise(id ?? ''),
    enabled: Boolean(id),
  })

  const chips = useMemo(
    () => ({
      equipment: data?.equipment ?? [],
      muscles: data?.muscle_groups ?? [],
    }),
    [data],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Упражнение</p>
          <h1 className="text-3xl font-bold tracking-tight">{data?.name ?? 'Детали упражнения'}</h1>
          <p className="text-muted-foreground">
            Категория: {data?.category ?? '—'} · Сложность: {data?.difficulty ?? '—'}
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link to="/app/exercises">Назад к списку</Link>
        </Button>
      </div>

      {isLoading && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Загружаем упражнение...</CardTitle>
            <CardDescription>Получаем данные из локального хранилища.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Не удалось загрузить упражнение</CardTitle>
            <CardDescription className="text-destructive">
              {error.message || 'Проверьте локальные данные.'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && data && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>{data.name}</CardTitle>
            <CardDescription>{data.category ?? 'Категория не указана'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {data.description && <p className="leading-relaxed text-foreground">{data.description}</p>}

            <div className="space-y-2">
              <p className="font-medium text-foreground">Оборудование</p>
              <div className="flex flex-wrap gap-2">
                {chips.equipment.length ? (
                  chips.equipment.map((item) => (
                    <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">Без оборудования</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">Целевые мышцы</p>
              <div className="flex flex-wrap gap-2">
                {chips.muscles.length ? (
                  chips.muscles.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-secondary/20 px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">Не указаны</span>
                )}
              </div>
            </div>

            {data.video_url && (
              <div className="space-y-2">
                <p className="font-medium text-foreground">Видео</p>
                <Button asChild variant="secondary">
                  <a href={data.video_url} target="_blank" rel="noreferrer">
                    Открыть видео
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && !data && (
        <Card>
          <CardHeader>
            <CardTitle>Упражнение не найдено</CardTitle>
            <CardDescription>Проверьте ссылку или вернитесь к списку.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

export default ExerciseDetailsPage
