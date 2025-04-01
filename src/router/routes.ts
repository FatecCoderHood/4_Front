// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

import Inicial from '@/pages/Inicial.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Farms from '@/pages/Farms.vue'
import Map from '@/pages/Map.vue'
import Users from '@/pages/Users.vue'
import NotFound from '@/pages/NotFound.vue'
import Index from '@/pages/index.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: Index,
        meta: {
            title: 'Home',
            requiresAuth: true,
            showMenu: false
        }
    },
    {
        path: '/Inicial',
        component: Inicial,
        meta: {
            title: 'Login',
            requiresAuth: false,
            showMenu: false
        }
    },
    {
        path: '/Dashboard',
        component: Dashboard,
        meta: {
            title: 'Dashboard',
            requiresAuth: true,
            showMenu: true
        }
    },
    {
        path: '/Farms',
        component: Farms,
        meta: {
            title: 'Fazendas',
            requiresAuth: true,
            showMenu: true
        }
    },
    {
        path: '/Map',
        component: Map,
        meta: {
            title: 'Mapa',
            requiresAuth: true,
            showMenu: true
        }
    },
    {
      path: '/Users',
      component: Users,
      meta: {
        title: 'Usuários',
        requiresAuth: true,
        showMenu: true
      }
    },
  
    // Catch-all route for undefined paths (404 page)
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]

export default routes
