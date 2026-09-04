import { create } from 'zustand'
import { account } from '@/lib/appwrite'

interface AuthState {
  user: any | null
  isLoading: boolean
  checkSession: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  checkSession: async () => {
    try {
      const user = await account.get()
      set({ user, isLoading: false })
    } catch (e) {
      set({ user: null, isLoading: false })
    }
  },
  logout: async () => {
    try {
      await account.deleteSession('current')
    } catch (e) {
      // ignore
    }
    set({ user: null })
  },
}))
