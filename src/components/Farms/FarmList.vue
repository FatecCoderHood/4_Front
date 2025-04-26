<template>
  <v-card class="mb-6">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">Lista de Fazendas</span>
      <v-btn color="primary" @click="$emit('add-farm')">
        <v-icon left>mdi-plus</v-icon>
        Adicionar
      </v-btn>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="farms"
      :loading="loading"
      :items-per-page="10"
      class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">
        <FarmTableActions 
          :farm="item" 
          @edit="$emit('edit-farm', item)" 
          @delete="$emit('delete-farm', item.id)"
        />
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FarmTableActions from './FarmTableActions.vue';

export default defineComponent({
  components: { FarmTableActions },
  props: {
    farms: { type: Array, required: true },
    loading: { type: Boolean, default: false }
  },
  data() {
    return {
      headers: [
        { title: 'NOME', value: 'nome' },
        { title: 'CIDADE', value: 'cidade' },
        { title: 'ESTADO', value: 'estado' },
        { title: 'AÇÕES', value: 'actions', sortable: false }
      ]
    };
  },
  emits: ['add-farm', 'edit-farm', 'delete-farm']
});
</script>