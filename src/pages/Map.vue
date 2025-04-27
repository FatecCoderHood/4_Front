<template>
  <div class="map-page">
    <FarmsMenu 
      ref="farmsMenu"
      @select-area="handleAreaSelection"
      @sidebar-toggle="handleSidebarToggle"
    />
    
    <div id="map" ref="mapContainer"></div>
    
    <MapControls
      v-if="map"
      :map="map"
      :show-edit-button="!!selectedArea"
      @toggle-edit="toggleDrawingMode"
    />
    
    <GeoJSONLayer
      v-if="map"
      ref="geoJSONLayer"
      :map="map"
      :area="selectedArea"
      :editable="isDrawingMode"
      @edit-complete="handleEditComplete"
    />
    
    <DrawingPanel
      v-if="selectedArea && isDrawingMode"
      :area="selectedArea"
      @save="saveDrawing"
      @cancel="cancelDrawing"
    />
      
    <!-- Modal de Status -->
    <StatusActions 
      :visible="showStatusActions"
      :farmId="selectedArea?.id || 0"
      @approve="approveFarm" 
      @reject="rejectFarm"
    />
    
    <!-- Botão de controle de mapa melhorado -->
    <div class="map-style-control">
      <button class="map-style-button" @click="showMapStyleOptions = !showMapStyleOptions">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6l9-4 9 4-9 4-9-4z"></path>
          <path d="M3 13l9 4 9-4-9-4-9 4z"></path>
          <path d="M3 20l9 4 9-4-9-4-9 4z"></path>
        </svg>
      </button>
      
      <div v-if="showMapStyleOptions" class="map-style-options">
        <h4>Estilo do Mapa</h4>
        <select v-model="selectedMapStyle" @change="changeMapStyle">
          <option value="osm">OpenStreetMap</option>
          <option value="satellite">Satélite</option>
          <option value="topo">Topográfico</option>
          <option value="dark">Escuro</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw';
import FarmsMenu from '@/components/Map/FarmsMenu.vue';
import DrawingPanel from '@/components/Map/DrawingPanel.vue';
import MapControls from '@/components/Map/MapControls.vue';
import GeoJSONLayer from '@/components/Map/GeoJSONLayer.vue';
import StatusActions from '@/components/Map/StatusActions.vue'; // Importando o StatusActions
import { Farm, Talhao } from '@/types/farms';

export default defineComponent({
  name: 'MapPage',
  components: { FarmsMenu, DrawingPanel, MapControls, GeoJSONLayer, StatusActions }, // Registrando o StatusActions

  data() {
    return {
      map: null as L.Map | null,
      selectedArea: null as (Farm & { talhoes: Talhao[] }) | null,
      isDrawingMode: false,
      sidebarOpen: false,
      showMapStyleOptions: false,
      selectedMapStyle: 'osm',
      baseLayers: {} as Record<string, L.TileLayer>,
      currentBaseLayer: null as L.TileLayer | null,
      showStatusActions: false, // Variável para controlar a visibilidade do modal
      currentBaseLayer: null as L.TileLayer | null,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.initMap();
      this.initBaseLayers();
    });
  },

  methods: {
    initMap() {
      if (!this.$refs.mapContainer) return;
      
      this.map = L.map(this.$refs.mapContainer as HTMLElement).setView([-15.7801, -47.9292], 5);
      
      // Inicializa com OpenStreetMap como padrão
      this.baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
      
      this.currentBaseLayer = this.baseLayers.osm;
    },

    initBaseLayers() {
      if (!this.map) return;
      
      // Satélite
      this.baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });
      
      // Topográfico
      this.baseLayers.topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });
      
      // Escuro
      this.baseLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      });
    },

    changeMapStyle() {
      if (!this.map || !this.currentBaseLayer) return;
      
      this.map.removeLayer(this.currentBaseLayer);
      this.currentBaseLayer = this.baseLayers[this.selectedMapStyle];
      this.map.addLayer(this.currentBaseLayer);
    },

    handleAreaSelection(area: Farm & { talhoes: Talhao[] }) {
      this.selectedArea = area;
      this.showStatusActions = true;

      this.$nextTick(() => {
        // Atualiza o GeoJSONLayer
        if (this.$refs.geoJSONLayer) {
          (this.$refs.geoJSONLayer as any).displayGeoJSON(area);
        }

        // Atualiza diretamente no FarmsMenu o status atualizado
        const farmsMenu = this.$refs.farmsMenu as any;
        if (farmsMenu && farmsMenu.updateFarmStatus) {
          farmsMenu.updateFarmStatus(area.id, area.status);
        }
      });
    },

    handleSidebarToggle(isOpen: boolean) {
      this.sidebarOpen = isOpen;
      const controls = document.querySelector('.leaflet-top.leaflet-left');
      controls?.classList.toggle('shifted-leaflet', isOpen);
    },

    toggleDrawingMode(isEditing: boolean) {
      this.isDrawingMode = isEditing;
    },

    handleEditComplete(geojson: any) {
      console.log('GeoJSON editado:', geojson);
    },

    async saveDrawing() {
      try {
        // Lógica de salvamento aqui
        // Lógica de salvamento aqui
        alert('Alterações salvas com sucesso!');
        this.isDrawingMode = false;
      } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar alterações');
      }
    },

    cancelDrawing() {
      this.isDrawingMode = false;
    },

  async approveFarm(farmId: number) {
    console.log('Fazenda aprovada:', farmId);
    try {
      await this.updateFarmStatus(farmId, 'APROVADO'); // Atualiza diretamente o status
      this.showStatusActions = false; // Fecha o modal após aprovação
    } catch (error) {
      console.error('Erro ao aprovar fazenda:', error);
    }
  },

  async rejectFarm(farmId: number) {
    console.log('Fazenda recusada:', farmId);
    try {
      await this.updateFarmStatus(farmId, 'RECUSADO'); // Atualiza diretamente o status
      this.showStatusActions = false; // Fecha o modal após rejeição
    } catch (error) {
      console.error('Erro ao recusar fazenda:', error);
    }
  },

  async updateFarmStatus(farmId: number, status: string) {
    try {
      const response = await fetch(`http://localhost:8080/areas/${farmId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar o status da fazenda');
      }

      console.log('Status atualizado com sucesso no backend:', status);

      // Agora atualiza visualmente no componente FarmsMenu
      const farmsMenu = this.$refs.farmsMenu as any;
      if (farmsMenu && farmsMenu.updateFarmStatus) {
        farmsMenu.updateFarmStatus(farmId, status); // Propaga para FarmsMenu
      }
    } catch (error) {
      console.error('Erro ao atualizar status da fazenda:', error);
    }
  },
  },

  beforeUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
});
</script>

<style scoped>
.map-page {
  position: relative;
  width: 100%;
  height: 100vh;
}

#map {
  width: 100%;
  height: 100%;
}
</style>