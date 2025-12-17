import { useEffect } from 'react'
import { authClient, profileClient } from '@/lib/localDatabase'
import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    let isActive = true
    let unsubscribe: (() => void) | undefined

    const initialize = async () => {
      setLoading(true)

      const { user } = await authClient.getSession()
      if (!isActive) return

      setUser(user)

      if (user) {
        const profile = await profileClient.getProfile(user.id)
        if (isActive) {
          setProfile(profile)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)

      const unsubscribeAuth = authClient.onAuthStateChange(async (nextUser) => {
        setUser(nextUser)

        if (nextUser) {
          const profile = await profileClient.getProfile(nextUser.id)
          if (isActive) {
            setProfile(profile)
          }
        } else {
          setProfile(null)
        }
        setLoading(false)
      })

      unsubscribe = unsubscribeAuth
    }

    void initialize()

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [setLoading, setProfile, setUser])

  return useAuthStore()
}
