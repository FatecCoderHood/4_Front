<template>
   <div :class="['farm-sidebar', { open: isVisible }]">
     <h3>Fazendas Cadastradas</h3>
      <p v-if="loading">Carregando...</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="!loading && !errorMessage && farms.length === 0">Nenhuma fazenda cadastrada.</p>
      <ul v-if="!loading && !errorMessage && farms.length > 0">
        <li v-for="farm in farms" :key="farm.id">
          <button @click="$emit('select-farm', farm)">
            <strong>{{ farm.nome }}</strong><br>
            <small>{{ farm.localizacao }} • {{ farm.cultura }}</small>
          </button>
        </li>
      </ul>                   
    </div>  
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },  
  data() {
    return {
      farms: [] as any[],
      isListVisible: false,
      loading: false,
      errorMessage: '',
    };
  },
    mounted() {
    this.fetchFarms();
  },
  methods: {
    async fetchFarms() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const response = await fetch('http://localhost:8080/areas');
        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const data = await response.json();
        console.log('Dados brutos da API:', data);

        const processedFarms = [];
        for (const item of data) {
          try {
            if (!item || typeof item !== 'object') {
              console.warn('Item inválido ignorado:', item);
              continue;
            }

            let parsedGeojson = null;
            if (item.geojson) {
              try {
                parsedGeojson = typeof item.geojson === 'string'
                  ? JSON.parse(item.geojson)
                  : item.geojson;
              } catch (e) {
                console.error('Erro ao parsear GeoJSON:', e);
                parsedGeojson = null;
              }
            }

            processedFarms.push({
              id: item.id || `farm-${Math.random().toString(36).substr(2, 9)}`,
              nome: item.nome || `Fazenda ${item.id || 'Sem Nome'}`,
              localizacao: item.localizacao || 'Local não informado',
              cultura: item.cultura || 'Cultura não informada',
              produtividade: item.produtividade || 'Não informada',
              parsedGeojson
            });
          } catch (e) {
            console.error('Erro ao processar fazenda:', item, e);
          }
        }

        this.farms = processedFarms;
        console.log('Fazendas processadas:', this.farms);

      } catch (error) {
        this.errorMessage = 'Erro ao carregar fazendas';
        console.error('Erro na requisição:', error);
      } finally {
        this.loading = false;
      }
    },

  }
});
</script>

<style>
.farm-btn, .draw-btn {
  background: white;
  border: none;
  padding: 6px;
  font-size: 18px;
  cursor: pointer;
  margin-bottom: 5px;
}

.farm-btn:hover, .draw-btn:hover {
  background: #ddd;
}

.farm-sidebar {
  position: fixed;
  top: 0;
  left: -260px;
  width: 250px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  transition: left 0.3s;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  overflow-y: auto;
}

.farm-sidebar.open {
  left: 0;
}

.farm-sidebar h3 {
  margin-bottom: 70px;
}

.farm-sidebar ul {
  list-style: none;
  padding: 0;
}

.farm-sidebar li {
  margin-bottom: 10px;
}

.farm-sidebar button {
  width: 100%;
  padding: 8px;
  background-color: #949191;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
}

.farm-sidebar button:hover {
  background-color: #313131;
}

.farm-sidebar button small {
  display: block;
  font-size: 0.8em;
  opacity: 0.8;
}

</style>