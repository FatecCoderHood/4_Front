//import Dashboard from '@/pages/Dashboard.vue'; // Exemplo de uma página protegida
import Inicial from '@/pages/Inicial.vue'; // Ajuste o caminho conforme necessário
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/inicial' }, // Rota padrão leva para a tela inicial
  { path: '/inicial', component: Inicial },
  //{ path: '/dashboard', component:Dashboard, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Proteção de rotas (impede acesso sem login)
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/inicial') // Redireciona para login se não estiver autenticado
  } else {
    next()
  }
})

export default router
