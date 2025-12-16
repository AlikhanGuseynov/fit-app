import { useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types/profile'

const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // PGRST116 = row not found
    if (error.code !== 'PGRST116') {
      console.error('[FitFlow] Failed to fetch user profile', error)
    }
    return null
  }

  return data as UserProfile
}

export const useAuth = () => {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    let isActive = true
    let unsubscribe: (() => void) | undefined

    const initialize = async () => {
      setLoading(true)

      let supabaseClient
      try {
        supabaseClient = getSupabaseClient()
      } catch (error) {
        console.warn('[FitFlow] Supabase client is not available', error)
        setLoading(false)
        return
      }

      const { data, error } = await supabaseClient.auth.getSession()
      if (!isActive) return

      if (error) {
        console.error('[FitFlow] Failed to get session', error)
        setLoading(false)
        return
      }

      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)

      if (sessionUser) {
        const profile = await fetchProfile(sessionUser.id)
        if (isActive) {
          setProfile(profile)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)

      const { data: subscription } = supabaseClient.auth.onAuthStateChange(
        async (_event, session) => {
          const nextUser = session?.user ?? null
          setUser(nextUser)

          if (nextUser) {
            const profile = await fetchProfile(nextUser.id)
            if (isActive) {
              setProfile(profile)
            }
          } else {
            setProfile(null)
          }
          setLoading(false)
        },
      )

      unsubscribe = () => {
        subscription?.subscription.unsubscribe()
      }
    }

    void initialize()

    return () => {
      isActive = false
      unsubscribe?.()
    }
  }, [setLoading, setProfile, setUser])

  return useAuthStore()
}
