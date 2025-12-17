import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const resetSchema = z.object({
  email: z.string().email('Введите корректный email'),
})

type ResetFormValues = z.infer<typeof resetSchema>

const ResetPasswordPage = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ResetFormValues) => {
    setStatusMessage(null)
    setErrorMessage(null)
    try {
      setStatusMessage('Письмо для сброса пароля отправлено (локальный режим).')
    } catch (error) {
      console.error('[FitFlow] Password reset failed', error)
      setErrorMessage('Не удалось отправить письмо. Попробуйте позже.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-md border-border/80 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Сброс пароля</CardTitle>
          <CardDescription>Получите ссылку для восстановления на почту.</CardDescription>
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
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            {statusMessage && <p className="text-sm text-emerald-600">{statusMessage}</p>}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Отправляем...' : 'Отправить ссылку'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline">
                Вернуться ко входу
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPasswordPage
