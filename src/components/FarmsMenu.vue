<template>
   <div :class="['farm-sidebar', { open: isVisible }]">
     <h3>Fazendas Cadastradas</h3>
     <div class="search-container">
       <svg class="search-icon" viewBox="0 0 20 20">
         <g stroke="black" fill="none">
          <path d="M18.5 18.3l-5.4-5.4" />
          <circle r="7" cy="8" cx="8" />
        </g>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Pesquise por nome"
           class="search-input"
         />
       </div> 
      <p v-if="noDataMessage" class="error">{{ noDataMessage }}</p>
      <ul v-if="!loading && !errorMessage && farms.length > 0">
        <li v-for="farm in filteredFarms" :key="farm.id">
          <button @click="$emit('select-farm', farm)">
            <span class="status-indicator" :style="{ backgroundColor: farm.statusColor }"></span>
            <div class="farm-button-text">
              <strong>{{ farm.nome }}</strong><br>
              <small>{{ farm.localizacao }} • {{ farm.cultura }}</small>
            </div>
            <div class="status-label">
              <span class="status-dot" :style="{ backgroundColor: farm.statusColor }"></span>
              <span class="status-text"> {{ farm.statusLabel }}</span>
            </div>
          </button>
        </li>
      </ul>                   
    </div> 
    
    <button class="toggle-btn" :class="{ 'btn-closed': !isVisible }" @click="toggleSidebar">
         <svg  class="arrow" :style="{ transform: isVisible ? 'rotate(270deg)' : 'rotate(90deg)' }" viewBox="0 0 512 512" width="16" height="16"><path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"></path></svg>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({  
  data() {
    return {
      farms: [] as any[],
      isVisible: false,
      loading: false,
      errorMessage: '',
      searchQuery: '',
    };
  },
  computed:{
    filteredFarms() {
      if (!this.searchQuery) {
        return this.farms;
      }
      const query = this.searchQuery.toLowerCase();
      return this.farms.filter(farm => {
        return farm.nome.toLowerCase().includes(query); 
      });
    },

  noDataMessage() {
    if (this.loading) return 'Carregando...';
    if (this.errorMessage) return this.errorMessage;
    if (this.farms.length === 0) return 'Nenhuma fazenda cadastrada.';
    if (this.filteredFarms.length === 0) return 'Nenhuma fazenda encontrada.';
    return '';
  },

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

            let statusColor = '';
            let statusLabel = '';

            if(item.status === 'aprovado'){
              statusColor = 'blue';
              statusLabel = 'Aprovado';
            } else if (item.status === 'reprovado'){
              statusColor = 'orange';
              statusLabel = 'Reprovado';
            } else{
              statusColor = 'grey';
              statusLabel = 'Em análise';
            }

            processedFarms.push({
              id: item.id || `farm-${Math.random().toString(36).substr(2, 9)}`,
              nome: item.nome || `Fazenda ${item.id || 'Sem Nome'}`,
              localizacao: item.localizacao || 'Local não informado',
              cultura: item.cultura || 'Cultura não informada',
              produtividade: item.produtividade || 'Não informada',
              parsedGeojson,
              statusColor,
              statusLabel,
              status: item.status || 'em análise',
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

    toggleSidebar() {
      this.isVisible = !this.isVisible;
      this.$emit('sidebar-toggle', this.isVisible);
     }
  }
});
</script>

<style>
.farm-sidebar {
  position: fixed;
  top: 0;
  left: -268px;
  width: 268px;
  height: 100%;
  background: #F1FAFC;
  padding: 15px;
  transition: left 0.3s;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  overflow-y: auto;
  border-radius: 0 5px 5px 0;
}

.farm-sidebar.open {
  left: 0;
}

.farm-sidebar h3 {
  margin-bottom: 70px;
}

.farm-sidebar ul {
  list-style:none;
  padding: 0;
}

/*estilização scrollbar */
.farm-sidebar::-webkit-scrollbar {
  width: 6px;
}
.farm-sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.farm-sidebar::-webkit-scrollbar-thumb {
  background-color: #D9D9D9;
  border-radius: 4px;
}
.farm-sidebar::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}


.farm-sidebar button {
  display: flex;
  gap: 12px;
  width: 208px;
  height: 80px;
  margin-left: 12px;
  background-color: #D9D9D9;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
}

.farm-sidebar li {
  margin-bottom: 20px;
}

.farm-button-text {
  padding-top: 8px;
  text-align: left;
  flex-direction: column;
  justify-content: center;
}

.farm-sidebar button:hover {
  background-color: #999;
}

.farm-sidebar button small {
  display: block;
  font-size: 0.8em;
  opacity: 0.8;
}

.status-indicator {
  width: 6px;
  height: 100%;
  border-radius: 5px 0 0 5px;
  flex-shrink: 0;
}

.status-approved {
  background-color: #023047;
}

.status-rejected {
  background-color: #fe5000;
}

.status-pending {
  background-color: #A0A0A0;
}

.status-label {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 0.75em;
  color: black;
  position: absolute;
  bottom: 8px; 
  padding-left: 18px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-text {
  font-weight:440;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 250px;
  margin-bottom: 40px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  pointer-events: none;
  opacity: 0.8;
}

.search-input {
  width: 208px;
  padding: 4px 4px 4px 32px; /* Espaço à esquerda pro ícone */
  border-radius: 8px;
  border: none;
  background-color: #D9D9D9;
  outline: none;
  font-size: 14px;
  font-weight: 400;
}

.search-input::placeholder{
  opacity: 0.6;
  font-size: 12px;
  font-weight: 450;
}

.toggle-btn {
  position: absolute !important;
  left: 246px;
  top: 110px;
  width: 36px !important; 
  height: 36px !important;
  background: #F1FAFC;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
  z-index: 1002 !important;
}

.btn-closed {
  left: 10px !important; 
}

.arrow {
    transform-origin: center;
    transition: transform 0.3s ease;
  }

.arrow path {
  fill: black;
}

</style>