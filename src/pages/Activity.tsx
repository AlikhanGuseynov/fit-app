import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ActivityPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-primary">Активность</p>
        <h1 className="text-3xl font-bold tracking-tight">Тренировки и сессии</h1>
        <p className="text-muted-foreground">Страница для списка тренировок и быстрых действий.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Скоро здесь</CardTitle>
          <CardDescription>Интерактивная панель для запуска и отслеживания сессий.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Добавим дополнительные сценарии после расширения локального хранилища.
        </CardContent>
      </Card>
    </div>
  )
}

export default ActivityPage
