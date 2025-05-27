<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2>Dashboard</h2>
      </v-col>
    </v-row>
    <DashboardBody 
      :users="analysts" 
      :farms="farms" 
    />
  </v-container>
</template>

<script setup lang="ts">
import DashboardBody from '@/components/Dashboard/DashboardBody.vue';
import api from '@/utils/api'; // Usar a instância configurada do axios
import { onMounted, ref } from 'vue';
import type { Farm, User } from '@/types/farms';

const farms = ref<Farm[]>([]);
const analysts = ref<User[]>([]);

async function fetchFarms() {
  try {
    const response = await api.get('/areas');
    farms.value = response.data.map((farm: Farm) => ({
       ...farm,
      talhoes: farm.talhoes || []
     }));
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error);
   }
}

async function fetchUsers() {
  try {
    const response = await api.get('/users/analistas/estatisticas');
    analysts.value = response.data;
    } catch (error){
      console.error('Erro ao buscar analistas:', error);
    }
  }

    
onMounted(() => {
  fetchFarms();
  fetchUsers();
})
</script>
