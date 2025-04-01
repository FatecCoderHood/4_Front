import { createRouter, createWebHistory } from 'vue-router'
import Inicial from '@/pages/Inicial.vue'
import Users from '@/pages/Users.vue'
import NotFound from '@/pages/NotFound.vue'

const routes = [
  {
    path: '/Inicial',
    component: Inicial,
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/Users',
    component: Users,
    meta: {
      title: 'Usuários',
      requiresAuth: true
    }
  },

  // Catch-all route for undefined paths (404 page)
  { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation Guard to check for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user') // Check if user is authenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page if the route requires auth and the user is not authenticated
    next({
      path: '/inicial',
      query: { redirect: to.fullPath }, // Store the attempted route
    });
  } else {
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
