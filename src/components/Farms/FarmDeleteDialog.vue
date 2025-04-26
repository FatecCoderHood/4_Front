<template>
    <v-dialog v-model="open" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Confirmar exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir esta fazenda?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="close">Cancelar</v-btn>
          <v-btn color="error" text @click="confirm" :loading="loading">
            Excluir
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
      loading: { type: Boolean, default: false }
    },
    emits: ['close', 'confirm'],
    setup(props, { emit }) {
      function close() {
        emit('close');
      }
  
      function confirm() {
        emit('confirm');
      }
  
      return {
        close,
        confirm
      };
    }
  });
  </script>