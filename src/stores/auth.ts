import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('user') || null as string | null,
    role: (localStorage.getItem('role') as 'Administrador' | 'Consultor' | 'Analista' | '') || '',
    isAuthenticated: !!localStorage.getItem('user'),
    expiresAt: localStorage.getItem('expiresAt') ? Number(localStorage.getItem('expiresAt')) : null,
  }),
  actions: {
    init() {
        // ✅ Initialize from localStorage after Pinia is ready
        this.user = localStorage.getItem('user') || null
        this.role = localStorage.getItem('role') as 'Administrador' | 'Consultor' | 'Analista' | ''
        this.isAuthenticated = !!localStorage.getItem('user')
        this.expiresAt = Number(localStorage.getItem('expiresAt')) || null
  
        this.checkAuth()
    },
    checkAuth() {
        if (!this.expiresAt || Date.now() > this.expiresAt)
          this.logout()
    },
    login(username: string, role: 'Administrador' | 'Consultor' | 'Analista') {
      const expirationTime = Date.now() + 1000 * 60 * 60 * 24 // ⏳ Expires in 24 hours

      this.user = username
      this.role = role
      this.isAuthenticated = true
      this.expiresAt = expirationTime

      localStorage.setItem('user', username)
      localStorage.setItem('role', role)
      localStorage.setItem('expiresAt', expirationTime.toString())
    },
    logout() {
      this.user = null
      this.role = null
      this.isAuthenticated = false
      this.expiresAt = null

      localStorage.removeItem('user')
      localStorage.removeItem('role')
      localStorage.removeItem('expiresAt')
    },
  },
})