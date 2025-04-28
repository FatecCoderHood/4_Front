<template>
     <v-navigation-drawer
        v-bind="$attrs"
        width="450"
        color="#E6E6E6"
        style="margin: 0;"
        class="custom-drawer"
      >
      <div>
        <h1 style="margin-top: 10px; margin-left: 20px;">GEOHOOD</h1>
      </div>
      <div class="drawer-footer-btn">
      <v-btn color="#1F272F" @click="$emit('saveChanges')" style="width: 100px; height: 28px; font-size: 11px;" >Confirmar</v-btn>
    </div>
      <slot></slot>
      </v-navigation-drawer>
</template>


<style scoped>
.custom-drawer {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}
</style>

<style scoped>
.drawer-footer-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
}
</style>

<script setup>
const emit = defineEmits();
</script>