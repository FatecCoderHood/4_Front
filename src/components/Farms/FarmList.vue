<template>
  <v-card style="background-color: #F1FAFC;">
    <v-card-title class="d-flex justify-end align-center">
          <div class="search-container-farm">
            <svg class="search-icon-farm" viewBox="0 0 20 20">
              <g stroke="black" fill="none">
                <path d="M18.5 18.3l-5.4-5.4" />
                <circle r="7" cy="8" cx="8" />
              </g>
              </svg>
              <input
                v-model="searchQueryNameLocation"
                type="text"
                placeholder="Pesquise por nome ou localização"
                class="search-input-farm"
              />
          </div> 
          <v-btn color="#FE5000" @click="$emit('add-farm')" style="color: #023047; height: 40px;">
          <div style="width: 24px; display: flex; justify-content: center; margin-right: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#023047" stroke-width="1.5" stroke-linecap="round">
              <path d="M12 21c-5-4.5-8-8-8-11a8 8 0 0 1 16 0c0 3-3 6.5-8 11z"></path>
              <circle cx="12" cy="10" r="3"></circle>
              <line x1="19" y1="2" x2="19" y2="8"></line>
              <line x1="16" y1="5" x2="22" y2="5"></line>
            </svg>
            </div>
            Adicionar
          </v-btn>
        </v-card-title>

    <v-data-table
      :headers="headers"
      :items="filteredFarms"
      :loading="loading"
      :items-per-page="10"
      class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">
        <FarmTableActions 
          :farm="item" 
          @edit="$emit('edit-farm', item)" 
          @delete="$emit('delete-farm', item.id)"
          @view="$emit('view-talhao', item)"
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
      searchQueryNameLocation: '',
      headers: [
        { title: 'Nome', value: 'nome', align: 'left', sortable: true },
        { title: 'Cidade', value: 'cidade', align: 'left', sortable: true},
        { title: 'Estado', value: 'estado', align: 'left', sortable: true },
        { title: 'Ações', value: 'actions', align: 'end', sortable: false }
      ]
    };
  },
  computed: {
    filteredFarms() {
      const query = this.searchQueryNameLocation.trim().toLowerCase();
      if (!query) {
        return this.farms;
      }
      return this.farms.filter((farm: any) => {
        return (
          (farm.nome && farm.nome.toLowerCase().includes(query)) ||
          (farm.cidade && farm.cidade.toLowerCase().includes(query)) ||
          (farm.estado && farm.estado.toLowerCase().includes(query))
        );
      });
    }
  },
  emits: ['add-farm', 'edit-farm', 'delete-farm', 'view-talhao']
});
</script>

<style scoped>
.v-card-title {
  padding: 16px;
}

.v-data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #F1FAFC;
}

.search-container-farm {
  position: relative;
  margin-right: 16px;
}

.search-icon-farm {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  pointer-events: none;
  opacity: 0.8;
}

.search-input-farm {
  width: 380px;
  height: 40px;
  padding: 4px 4px 4px 32px; /* Espaço à esquerda pro ícone */
  border-radius: 4px;
  border: none;
  background-color: #C9DDE3;
  outline: none;
  font-size: 12px;
  font-weight: 400;
}

.search-input-farm::placeholder{
  opacity: 0.6;
  font-size: 12px;
  font-weight: 450;
}
</style>