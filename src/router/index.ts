import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import routes from "@/router/routes"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guard to check for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role
  const allowedRoles: String[] = to.meta.allowedRoles as String[]

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page if the route requires auth and the user is not authenticated
    next({ path: '/inicial', query: { redirect: to.fullPath } });
  } else if (to.meta.allowedRoles && !allowedRoles.includes(userRole)) {
    next('/403') // Redirect to a "Forbidden" page
  }
  else {
    next() // Allow navigation to the route
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
