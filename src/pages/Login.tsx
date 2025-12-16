import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const LoginPage = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      navigate('/app/dashboard')
    } catch (error) {
      console.error('[FitFlow] Login failed', error)
      setErrorMessage('Не удалось подключиться к Supabase. Проверьте настройки окружения.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-md border-border/80 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Войти</CardTitle>
          <CardDescription>Добро пожаловать обратно! Продолжим ваш прогресс.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Входим...' : 'Войти'}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/reset-password" className="text-primary hover:underline">
                Забыли пароль?
              </Link>
              <Link to="/register" className="text-muted-foreground hover:text-foreground">
                Создать аккаунт
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
