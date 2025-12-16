import { Link } from 'react-router-dom'
import { ArrowRight, Bolt, Dumbbell, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-14">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">FitFlow</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Ваш персональный фитнес-центр: планы, прогресс и привычки в одном месте.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Создавайте тренировки, отслеживайте вес и шаги, записывайте воду и калории. Мы поможем
              держать темп и видеть результат.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/register" className="flex items-center gap-2">
                  Начать бесплатно <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">У меня уже есть аккаунт</Link>
              </Button>
            </div>
          </div>
          <Card className="w-full max-w-sm border-primary/30 shadow-lg shadow-primary/10">
            <CardHeader>
              <CardTitle>Быстрый обзор</CardTitle>
              <CardDescription>Мгновенно видите прогресс по ключевым метрикам.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Следующая тренировка</p>
                    <p className="font-semibold">Силовая · Завтра 09:00</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Шаги сегодня</p>
                    <p className="font-semibold">6 420 / 10 000</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">+12%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Bolt className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Калории сегодня</p>
                    <p className="font-semibold">1 980 / 2 300</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">На цели</span>
              </div>
            </CardContent>
          </Card>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Индивидуальные планы',
              desc: 'На основе целей и оборудования. Готовы к выполнению и повторению.',
            },
            {
              title: 'Отслеживание прогресса',
              desc: 'Вес, вода, шаги, калории и тренировки — всё в одном графике.',
            },
            {
              title: 'Быстрые действия',
              desc: 'Добавляйте воду или шаги, запускайте тренировку в один тап.',
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/80 bg-card/70 backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}

export default LandingPage
