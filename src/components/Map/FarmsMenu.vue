<template>
  <div :class="['farm-sidebar', { open: isVisible }]">
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
        <button @click="selectFarm(farm)">
          <span class="status-indicator" :style="{ backgroundColor: farm.statusColor }"></span>
          <div class="farm-button-text">
            <strong>{{ farm.nome }}</strong><br>
            <small>{{ farm.cidade }}, {{ farm.estado }}</small>
          </div>
          <div class="status-label">
            <span class="status-text">{{ farm.statusLabel }}</span>
          </div>
        </button>
      </li>
    </ul>
  </div>

  <button class="toggle-btn" :class="{ 'btn-closed': !isVisible }" @click="toggleSidebar">
    <svg class="arrow" :style="{ transform: isVisible ? 'rotate(270deg)' : 'rotate(90deg)' }" viewBox="0 0 512 512" width="16" height="16">
      <path d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"></path>
    </svg>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Farm, Talhao } from '@/types/farms';

interface FarmWithTalhoes extends Farm {
  talhoes: Talhao[];
  statusColor: string;
  statusLabel: string;
}

export default defineComponent({
  name: 'FarmsMenu',
  emits: ['select-area', 'sidebar-toggle'],

  data() {
    return {
      farms: [] as FarmWithTalhoes[],
      isVisible: false,
      loading: false,
      errorMessage: '',
      searchQuery: '',
    };
  },

  computed: {
    filteredFarms(): FarmWithTalhoes[] {
      if (!this.searchQuery) return this.farms;
      const query = this.searchQuery.toLowerCase();
      return this.farms.filter(farm =>
        farm.nome.toLowerCase().includes(query) ||
        farm.cidade.toLowerCase().includes(query)
      );
    },

    noDataMessage(): string {
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
    selectFarm(farm: FarmWithTalhoes) {
      console.log('Fazenda selecionada:', farm);
      this.$emit('select-area', {
        ...farm,
        talhoes: farm.talhoes || [],
      });
    },

    async fetchFarms() {
      this.loading = true;
      try {
        const response = await fetch('http://localhost:8080/areas');
        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const data = await response.json();
        console.log('Dados recebidos:', data);

        this.farms = data.map((farm: any) => ({
          ...farm,
          talhoes: farm.talhoes || [],
          status: farm.status || 'em_analise',
          statusColor: this.getStatusColor(farm.status || 'em_analise'),
          statusLabel: this.getStatusLabel(farm.status || 'em_analise'),
        }));
      } catch (error) {
        this.errorMessage = 'Erro ao carregar fazendas.';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    updateFarmStatus(farmId, newStatus) {
      const farmIndex = this.farms.findIndex(farm => farm.id === farmId);
      if (farmIndex >= 0) {
        this.farms[farmIndex] = {
          ...this.farms[farmIndex],
          status: newStatus,
          statusColor: this.getStatusColor(newStatus.toLowerCase()),
          statusLabel: this.getStatusLabel(newStatus.toLowerCase()),
        };
        this.farms = [...this.farms]; // Force reactivityS
      }
    },

    getStatusColor(status: string) {
      const statusMap: Record<string, string> = {
        'em_analise': 'grey',
        'ativo': '#4CAF50',
        'inativo': '#f44336',
        'aprovado': '#008CBA',
        'recusado': '#FF6347',
      };
      return statusMap[status.toLowerCase()] || '';
    },

    getStatusLabel(status: string) {
      const labelMap: Record<string, string> = {
        'em_analise': 'Em análise',
        'ativo': 'Ativo',
        'inativo': 'Inativo',
        'aprovado': 'Aprovado',
        'recusado': 'Recusado',
      };
      return labelMap[status.toLowerCase()] || '';
    },

    toggleSidebar() {
      this.isVisible = !this.isVisible;
      this.$emit('sidebar-toggle', this.isVisible);
    },
  },
});
</script>

<style scoped>
.farm-sidebar {
  position: absolute;
  left: -268px;
  width: 268px;
  height: 100%;
  background: #F1FAFC;
  padding: 16px;
  transition: left 0.3s;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  overflow-y: auto;
  border-radius: 0 8px 8px 0;
}

.farm-sidebar.open {
  left: 0;
}

.farm-sidebar ul {
  list-style: none;
  padding: 0;
}

.farm-sidebar button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 208px;
  height: 70px;
  margin-left: 12px;
  background-color: #D9D9D9;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  padding: 8px;
  text-align: left;
}

.farm-sidebar li {
  margin-bottom: 20px;
}

.farm-button-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.farm-button-text strong {
  font-size: 0.9rem;
}

.farm-button-text small {
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: 4px;
}

.status-indicator {
  width: 6px;
  height: 100%;
  border-radius: 5px 0 0 5px;
  flex-shrink: 0;
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
  padding: 4px 4px 4px 32px;
  border-radius: 8px;
  border: none;
  background-color: #D9D9D9;
  outline: none;
  font-size: 14px;
  font-weight: 400;
}

.toggle-btn {
  position: absolute !important;
  left: 246px;
  top: 12px;
  width: 36px !important; 
  height: 36px !important;
  background: #F1FAFC;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
  z-index: 1002 !important;
  border: none;
  cursor: pointer;
}

.btn-closed {
  left: 10px !important; 
}

.arrow {
  transform-origin: center;
  transition: transform 0.3s ease;
}

.error {
  color: #ff4444;
  text-align: center;
  padding: 10px;
  font-size: 0.9em;
}

.status-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 4px 8px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  color: black;
}

.status-text {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.7);
}
</style>