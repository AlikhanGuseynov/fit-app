import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Moon, Speaker } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { NotificationSettings } from '@/types/tracking'

const defaultSettings: Omit<NotificationSettings, 'id' | 'user_id'> = {
  push_enabled: true,
  email_enabled: false,
  reminders_enabled: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  preferred_times: ['09:00', '18:00'],
}

const fetchSettings = async (userId: string): Promise<NotificationSettings | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notification_settings')
    .select(
      'id,user_id,push_enabled,email_enabled,reminders_enabled,quiet_hours_start,quiet_hours_end,preferred_times,updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as NotificationSettings | null
}

const NotificationsPage = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [pushOverride, setPushOverride] = useState<boolean | null>(null)
  const [emailOverride, setEmailOverride] = useState<boolean | null>(null)
  const [remindersOverride, setRemindersOverride] = useState<boolean | null>(null)
  const [quietStartOverride, setQuietStartOverride] = useState<string | null>(null)
  const [quietEndOverride, setQuietEndOverride] = useState<string | null>(null)
  const [preferredTimesOverride, setPreferredTimesOverride] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: () => fetchSettings(user!.id),
    enabled: Boolean(user?.id),
  })

  const pushEnabled = pushOverride ?? settings?.push_enabled ?? defaultSettings.push_enabled
  const emailEnabled = emailOverride ?? settings?.email_enabled ?? defaultSettings.email_enabled
  const remindersEnabled = remindersOverride ?? settings?.reminders_enabled ?? defaultSettings.reminders_enabled
  const quietStart = quietStartOverride ?? settings?.quiet_hours_start ?? defaultSettings.quiet_hours_start
  const quietEnd = quietEndOverride ?? settings?.quiet_hours_end ?? defaultSettings.quiet_hours_end
  const preferredTimes =
    preferredTimesOverride ?? (settings?.preferred_times ?? defaultSettings.preferred_times).join(',')

  const saveSettings = useMutation({
    mutationFn: async () => {
      if (!user) return
      const supabase = getSupabaseClient()
      const preferred = preferredTimes
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      const { error: upsertError } = await supabase.from('notification_settings').upsert({
        user_id: user.id,
        push_enabled: pushEnabled,
        email_enabled: emailEnabled,
        reminders_enabled: remindersEnabled,
        quiet_hours_start: quietStart || null,
        quiet_hours_end: quietEnd || null,
        preferred_times: preferred,
      })
      if (upsertError) throw upsertError
    },
    onSuccess: async () => {
      setErrorMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['notification-settings', user?.id] })
    },
    onError: (mutationError: Error) => setErrorMessage(mutationError.message),
  })

  const quietHoursSummary = useMemo(() => {
    if (!quietStart || !quietEnd) return 'Не заданы'
    return `${quietStart} — ${quietEnd}`
  }, [quietStart, quietEnd])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Нужна авторизация</CardTitle>
          <CardDescription>Войдите, чтобы настроить уведомления.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Уведомления</p>
          <h1 className="text-3xl font-bold tracking-tight">Настройки уведомлений</h1>
          <p className="text-muted-foreground">Управляйте каналами, напоминаниями и тихими часами.</p>
        </div>
        <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
          Сохранить
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Каналы</CardTitle>
              <CardDescription>Включите необходимые каналы доставки.</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ToggleRow label="Push" checked={pushEnabled} onChange={setPushOverride} />
            <ToggleRow label="Email" checked={emailEnabled} onChange={setEmailOverride} />
            <ToggleRow label="Напоминания" checked={remindersEnabled} onChange={setRemindersOverride} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 backdrop-blur">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Тихие часы</CardTitle>
              <CardDescription>Сохраняем quiet hours в базе.</CardDescription>
            </div>
            <Moon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Начало</p>
                <Input
                  type="time"
                  value={quietStart}
                  onChange={(event) => setQuietStartOverride(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Конец</p>
                <Input
                  type="time"
                  value={quietEnd}
                  onChange={(event) => setQuietEndOverride(event.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Тихие часы: {quietHoursSummary}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/80 backdrop-blur">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Предпочитаемые времена</CardTitle>
            <CardDescription>Список времён через запятую, напр. 09:00,18:00.</CardDescription>
          </div>
          <Speaker className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Input
            value={preferredTimes}
            onChange={(event) => setPreferredTimesOverride(event.target.value)}
            placeholder="09:00,18:00"
          />
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          {error && (
            <p className="text-sm text-destructive">
              {error.message || 'Не удалось загрузить настройки уведомлений.'}
            </p>
          )}
          {isLoading && <p className="text-sm text-muted-foreground">Загружаем...</p>}
        </CardContent>
      </Card>
    </div>
  )
}

type ToggleRowProps = {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

const ToggleRow = ({ label, checked, onChange }: ToggleRowProps) => (
  <label className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 p-3">
    <span className="font-medium text-foreground">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-border text-primary focus-visible:outline-none"
    />
  </label>
)

export default NotificationsPage
