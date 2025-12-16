import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'
import type { UserProfile } from '@/types/profile'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  reset: () => void
}

const initialState = {
  user: null,
  profile: null,
  loading: false,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    set({ ...initialState })
  },
  reset: () => set({ ...initialState }),
}))
