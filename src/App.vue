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

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore) // Makes state reactive
</script>

<style>
  body {
    font-family: 'Roboto', sans-serif !important;
  }
</style>