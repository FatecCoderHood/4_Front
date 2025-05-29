<template>
  <v-card style="background-color: #F1FAFC;">
    <v-card-title class="d-flex justify-space-between align-center">
      <div>
          <v-btn color="#FE5000" @click="$emit('upload')" style="color: #023047; height: 40px;"> 
            Upload Arquivo Tiff           
            <svg style="margin-left: 8px;"width="16px" height="16px" viewBox="0 0 24.00 24.00"> 
              <path fill-rule="evenodd" d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z" fill="#023047"/></svg>
          </v-btn>  
        </div>    

        <div class="d-flex align-center" style="gap: 12px;">
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
        </div>  
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
  emits: ['add-farm', 'edit-farm', 'delete-farm', 'view-talhao', 'upload']
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