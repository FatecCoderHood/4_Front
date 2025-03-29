<template>
  <div class="d-flex justify-center align-center" style="height: 100vh; background-color: #1F272F;">
    <Login @login-sucesso="redirecionar" />
  </div>
</template>

<script setup>
import Login from '@/components/Login.vue'; // Ajuste o caminho conforme necessário
import { useRouter } from 'vue-router';

const router = useRouter()

//const redirecionar = () => {
//  router.push('/Dashboard')
//}
</script>
