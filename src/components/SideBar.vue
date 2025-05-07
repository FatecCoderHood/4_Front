<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="emit('update:drawer', $event)"
    location="right"
    temporary
    class="drawer-style"
    absolute
    width="320"
    z-index="1020"
  >
    <div
      class="d-flex justify-space-between align-center px-4"
      style="height: 100px"
    >
      <div class="d-flex justify-space-between align-center ga-1">
        <v-avatar size="24">
          <v-icon color="#023047">mdi-account-circle</v-icon>
        </v-avatar>
        <v-list-item-title style="font-size: 14px; color: #023047">{{
          userRole
        }}</v-list-item-title>
      </div>

      <v-btn icon variant="text" @click="emit('update:drawer', false)">
        <v-icon color="#023047">mdi-close</v-icon>
      </v-btn>
    </div>
    <!-- <p class="text-uppercase ml-2">Menu</p> -->
    <v-list>
      <v-list-item
        v-for="route in filteredRoutes"
        :key="route.path"
        :to="route.path"
      >
        <v-list-item-title class="items-list">
          {{ route.meta.title }}
        </v-list-item-title>
        <v-divider :thickness="2" color="#023047" />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";

defineProps({
  drawer: Boolean,
});

const emit = defineEmits(["update:drawer"]);

const router = useRouter();
const routes = router.getRoutes();

const authStore = useAuthStore();
const userRole = authStore.role;

// Computed to filter routes with title, showMenu, and allowedRoles
const filteredRoutes = computed(() => {
  return routes.filter((route) => {
    // Safely access meta and fallback to an empty object
    const meta = route.meta || {};

    // Explicitly cast allowedRoles to string[] or fallback to empty array
    const allowedRoles = (meta.allowedRoles as string[] | undefined) || [];

    return (
      meta.showMenu === true && // Show menu condition
      allowedRoles.includes(userRole) && // Role check
      meta.title // Ensure title exists
    );
  });
});
</script>

<style scoped lang="scss">
.drawer-style {
  background-color: $white !important;
  width: 250px;
  height: 100vh !important;
  color: $black;
  padding: 0 !important;
  top: 0px !important;
  z-index: 1020 !important;
  border-radius: 8px 0 0 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);

  .v-navigation-drawer__scrim {
    background-color: rgba(0, 0, 0, 0.7) !important;
    z-index: 1019 !important;
  }

  .items-list {
    font-size: 16px;
    color: $primary;
    font-weight: 500;
    padding: 8px 0;
    cursor: pointer;
  }
  .v-list-item--active {
    background-color: $light-blue;
  }
}
</style>
