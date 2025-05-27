<template>
  <v-app>
    <AppHeader v-if="isAuthenticated" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore) // Makes state reactive

// Initialize auth store when app mounts
onMounted(() => {
  authStore.init()
})
</script>

<style>
  body {
    font-family: 'Roboto', sans-serif !important;
  }
</style>