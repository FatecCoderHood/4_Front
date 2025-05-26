import axios from 'axios'

// Configuração global do axios
const api = axios.create({
  baseURL: '/api', // Use proxy instead of direct backend URL
  timeout: 50000,
  withCredentials: true, // Incluir cookies de sessão automaticamente
})

// Interceptor para adicionar logs de requisições (opcional, para debug)
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      
      // Clear auth store and redirect to login
      import('@/stores/auth').then(({ useAuthStore }) => {
        const authStore = useAuthStore()
        authStore.logout()
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/inicial') {
          window.location.href = '/inicial'
        }
      })
    }
    return Promise.reject(error)
  }
)

export default api
