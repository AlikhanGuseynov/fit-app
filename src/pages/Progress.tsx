import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ProgressPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary">Прогресс</p>
        <h1 className="text-3xl font-bold tracking-tight">Графики и динамика</h1>
        <p className="text-muted-foreground">Здесь появятся графики веса, шагов и воды.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Скоро здесь</CardTitle>
          <CardDescription>Добавим визуализацию метрик на следующих шагах.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Настроим Recharts и подключим данные Supabase после настройки бэкенда.
        </CardContent>
      </Card>
    </div>
  )
}

export default ProgressPage
