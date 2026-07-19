import { create } from 'zustand'
import { apiGet, apiPost, http, tokenStore } from '@/lib/api'
import type { AuthTokens, User } from '@/types'

interface LoginPayload {
  identifier: string
  password: string
}

interface AuthState {
  user: User | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  async login(payload) {
    const tokens = await apiPost<AuthTokens>('/auth/login', payload)
    tokenStore.set(tokens)
    const user = await apiGet<User>('/users/me')
    set({ user, status: 'authenticated' })
  },

  async logout() {
    const refreshToken = tokenStore.refresh
    try {
      if (refreshToken) {
        await http.post('/auth/logout', { refreshToken })
      }
    } finally {
      tokenStore.clear()
      set({ user: null, status: 'unauthenticated' })
    }
  },

  async bootstrap() {
    if (!tokenStore.access) {
      set({ status: 'unauthenticated' })
      return
    }
    set({ status: 'loading' })
    try {
      const user = await apiGet<User>('/users/me')
      set({ user, status: 'authenticated' })
    } catch {
      tokenStore.clear()
      set({ user: null, status: 'unauthenticated' })
    }
  },

  async refreshProfile() {
    const user = await apiGet<User>('/users/me')
    set({ user })
  },
}))
