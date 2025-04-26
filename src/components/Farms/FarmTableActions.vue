<template>
    <div>
      <v-icon color="primary" class="mr-3" @click="$emit('edit')">
        mdi-pencil
      </v-icon>
      <v-icon color="error" @click="$emit('delete')">
        mdi-delete
      </v-icon>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    props: {
      farm: { type: Object, required: true }
    },
    emits: ['edit', 'delete']
  });
  </script>