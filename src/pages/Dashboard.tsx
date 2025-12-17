import { ArrowUpRight, Droplets, Flame, Footprints } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Добро пожаловать в FitFlow</p>
        <h1 className="text-3xl font-bold tracking-tight">Сегодняшний прогресс</h1>
        <p className="text-muted-foreground">Следите за ключевыми метриками и продолжайте движение.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Шаги"
          value="6 420"
          helper="Цель 10 000"
          icon={<Footprints className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Вода"
          value="1.4 л"
          helper="Осталось 1.0 л"
          icon={<Droplets className="h-5 w-5 text-primary" />}
        />
        <StatCard
          title="Калории"
          value="1 980 / 2 300"
          helper="На цели"
          icon={<Flame className="h-5 w-5 text-primary" />}
        />
      </div>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string
  helper: string
  icon: ReactNode
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
