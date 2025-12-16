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

const registerSchema = z
  .object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(6, 'Минимум 6 символов'),
    confirmPassword: z.string().min(6, 'Минимум 6 символов'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      if (!data.session) {
        setSuccessMessage('Проверьте почту и подтвердите аккаунт, затем войдите в систему.')
        return
      }

      navigate('/onboarding')
    } catch (error) {
      console.error('[FitFlow] Registration failed', error)
      setErrorMessage('Не удалось подключиться к Supabase. Проверьте настройки окружения.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-md border-border/80 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Создать аккаунт</CardTitle>
          <CardDescription>Зарегистрируйтесь, чтобы начать персональный план.</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтверждение</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            {successMessage && <p className="text-sm text-emerald-600">{successMessage}</p>}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Создаем аккаунт...' : 'Продолжить'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Уже с нами?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Войти
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage
