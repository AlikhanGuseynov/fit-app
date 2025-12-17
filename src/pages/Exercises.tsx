import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { exercisesClient } from '@/lib/localDatabase'
import type { Exercise } from '@/types/exercise'

const fetchExercises = async (): Promise<Exercise[]> => {
  return exercisesClient.getExercises()
}

const ExercisesPage = () => {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string>('all')
  const [equipment, setEquipment] = useState<string>('all')
  const [category, setCategory] = useState<string>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  })

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesDifficulty = difficulty === 'all' || item.difficulty === difficulty
      const matchesCategory = category === 'all' || item.category === category
      const matchesEquipment =
        equipment === 'all' || (item.equipment ?? []).includes(equipment as string)
      return matchesSearch && matchesDifficulty && matchesCategory && matchesEquipment
    })
  }, [category, data, difficulty, equipment, search])

  const categories = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.map((item) => item.category).filter(Boolean))) as string[]
  }, [data])

  const equipments = useMemo(() => {
    if (!data) return []
    return Array.from(
      new Set(
        data
          .flatMap((item) => item.equipment ?? [])
          .filter(Boolean)
          .map((value) => value.trim()),
      ),
    )
  }, [data])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Библиотека упражнений</p>
        <h1 className="text-3xl font-bold tracking-tight">Найдите нужное упражнение</h1>
        <p className="text-muted-foreground">
          Используйте поиск и фильтры, чтобы быстро подобрать упражнения под ваши цели.
        </p>
      </div>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label htmlFor="search">Поиск</Label>
            <Input
              id="search"
              placeholder="Например, Squat"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="category">Категория</Label>
            <select
              id="category"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">Все</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="difficulty">Сложность</Label>
              <select
                id="difficulty"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option value="all">Все</option>
                <option value="beginner">Новичок</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>
            <div>
              <Label htmlFor="equipment">Оборудование</Label>
              <select
                id="equipment"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
              >
                <option value="all">Все</option>
                {equipments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Загружаем упражнения...</CardTitle>
            <CardDescription>Получаем данные из локального хранилища.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Не удалось загрузить упражнения</CardTitle>
            <CardDescription className="text-destructive">
              {error.message || 'Проверьте локальные данные.'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exercise) => (
            <Card key={exercise.id} className="border-border/70 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription className="space-y-1 text-sm">
                  {exercise.category && <div className="text-muted-foreground">{exercise.category}</div>}
                  {exercise.difficulty && (
                    <div className="text-muted-foreground capitalize">{exercise.difficulty}</div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  {(exercise.equipment ?? []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(exercise.muscle_groups ?? []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-secondary/20 px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <Button asChild variant="secondary" className="w-full">
                  <Link to={`/app/exercises/${exercise.id}`}>Подробнее</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Ничего не найдено</CardTitle>
                <CardDescription>Попробуйте изменить запрос или фильтры.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default ExercisesPage
