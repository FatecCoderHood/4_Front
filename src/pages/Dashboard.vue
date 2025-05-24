<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2>Dashboard</h2>
      </v-col>
    </v-row>
  <DashboardBody :users="analysts" :farms="farms"/>
  </v-container>
</template>

<script setup lang="ts">
import DashboardBody from '@/components/Dashboard/DashboardBody.vue';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import Users, { type User } from './Users.vue';

const farms = ref<any[]>([]);
const users = ref<any[]>([]);
const analysts = ref<any[]>([])

async function fetchFarms() {
  try {
    const response = await axios.get('http://localhost:8080/areas');
    farms.value = response.data.map((farm: any) => ({
       ...farm,
      talhoes: farm.talhoes || []
     }));
  } catch (error) {
    console.error('Erro ao buscar fazendas:', error);
   }
}

async function fetchUsers() {
  try {
    const response = await axios.get<User[]>('http://localhost:8080/users');
    users.value = response.data;
    analysts.value = users.value.filter(user => user.tipoAcesso === 'ANALISTA');
    } catch (error){
      console.error('Erro ao buscar usuários:', error);
    }
  }

    
onMounted(() => {
  fetchFarms();
  fetchUsers();
})
</script>
