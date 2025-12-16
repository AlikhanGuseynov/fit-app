import type { ReactElement, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): ReactElement => {
  const { user, profile, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="rounded-xl border border-border bg-card/80 px-6 py-4 text-sm text-muted-foreground shadow-sm backdrop-blur">
          Проверяем авторизацию...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return children as ReactElement
}

export default ProtectedRoute
