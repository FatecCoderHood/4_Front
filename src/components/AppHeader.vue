<template>
  <v-app-bar
    app
    class="app-header d-flex justify-center align-center px-8"
    height="100"
  >
    <!-- Logo e título -->
    <div class="d-flex align-center flex-row ga-2">
      <router-link to="/" class="logo-container">
        <v-img src="@/assets/logo.png" height="80" width="64" />
      </router-link>
      <div class="d-flex flex-column">
        <p class="title text-uppercase">GeoHood</p>
        <p class="sub-title text-lowercase">Tecnologia Agrícola</p>
      </div>
    </div>

    <v-spacer />

    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" color="white">
          <v-icon color="white">mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="logout">
          <v-list-item-title class="text-uppercase">Sair</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Ícone do menu hambúrguer -->
    <v-app-bar-nav-icon color="#fff" @click="toggleDrawer" />
  </v-app-bar>
  <!-- Sidebar importada -->
  <Sidebar v-model:drawer="drawer" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import Sidebar from "@/components/SideBar.vue";

const authStore = useAuthStore();
const router = useRouter();

const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const logout = () => {
  authStore.logout();
  router.push("/Inicial");
};
</script>

<style scoped lang="scss">
.app-header {
  background-color: $primary !important;
}

.logo-container {
  cursor: pointer;
}

// Estilização compartilhada
@mixin text-style {
  font-weight: 400;
  color: $white;
}

.title {
  @include text-style;
  font-size: 22px;
}

.sub-title {
  @include text-style;
  font-size: 16px;
}
</style>
