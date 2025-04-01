<template>
  <v-app>
    <AppHeader v-if="isAuthenticated"/>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
export default {
  created() {
    document.title = "Bem-vindo ao GeoHood" 
  },
  data() {
    return {
      isAuthenticated: !!localStorage.getItem('user')
    }
  }
}
</script>
