<template>
  <v-app-bar app class="app-header d-flex justify-center align-center px-5" height="100">
    <!-- Logo e título -->
    <div class="d-flex align-center flex-row ga-2">
      <router-link to="/" class="logo-container">
        <v-img src="@/assets/logo-coderhood.png" height="50" width="50" />
      </router-link>
      <div class="d-flex flex-column">
        <p class="title text-uppercase">GeoHood</p>
        <p class="sub-title text-lowercase">Tecnologia Agrícola</p>
      </div>
    </div>

    <v-spacer />

    <!-- Ícone de perfil -->
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar size="30">
            <v-img src="@/assets/account.png" alt="Profile" />
          </v-avatar>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="logout">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- Ícone do menu hambúrguer -->
    <v-app-bar-nav-icon color="black" @click="toggleDrawer" />
  </v-app-bar>
  <!-- Sidebar importada -->
  <Sidebar v-model:drawer="drawer" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "@/components/SideBar.vue";

const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

const logout = () => {
  alert("Logout clicked!");
};
</script>

<style scoped lang="sass">
.app-header
  background-color: #EFEDED !important

.logo-container
  cursor: pointer

// Estilização compartilhada
@mixin text-style
  font-weight: 400
  color: #1F272F

.title
  @include text-style
  font-size: 22px

.sub-title
  @include text-style
  font-size: 16px
  opacity: 0.44
</style>

