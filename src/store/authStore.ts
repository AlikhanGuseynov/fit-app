import { create } from 'zustand'
import type { AuthUser } from '@/lib/localDatabase'
import type { UserProfile } from '@/types/profile'
import { authClient } from '@/lib/localDatabase'

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
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
    await authClient.signOut()
    set({ ...initialState })
  },
  reset: () => set({ ...initialState }),
}))
