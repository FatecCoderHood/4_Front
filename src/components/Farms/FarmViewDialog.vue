<template>
    <v-dialog v-model="open" max-width="400">
      <v-card>
        <v-card-title>
            PAGINA AINDA EM CONSTRUÇÃO!!!
        </v-card-title>
        <v-card-actions>
          <v-btn text @click="close">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    props: {
      open: { type: Boolean, required: true },
    },
    emits: ['close', 'confirm'],
    setup(props, { emit }) {
      function close() {
        emit('close');
      }
  
      return {
        close
      };
    }
  });
</script>