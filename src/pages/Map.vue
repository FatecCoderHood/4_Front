<template>
  <div>
    <div :class="['farm-sidebar', { 'open': isListVisible }]">
      <h3>Fazendas Cadastradas</h3>
      <p v-if="loading">Carregando...</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="!loading && !errorMessage && farms.length === 0">Nenhuma fazenda cadastrada.</p>
      <ul v-if="!loading && !errorMessage && farms.length > 0">
        <li v-for="farm in farms" :key="farm.id">
          <button @click="selectFarm(farm)">
            <strong>{{ farm.nome }}</strong><br>
            <small>{{ farm.localizacao }} • {{ farm.cultura }}</small>
          </button>
        </li>
      </ul>
    </div>

    <div id="map"></div>
    
    <div v-if="selectedFarm && isDrawingMode" class="drawing-control-panel">
      <h4>Editando: {{ selectedFarm.nome }}</h4>
      <button @click="saveDrawing" class="save-btn">Salvar Polígono</button>
      <button @click="cancelDrawing" class="cancel-btn">Cancelar</button>
      <p class="hint">Desenhe o polígono da fazenda no mapa</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw';

export default defineComponent({
  data() {
    return {
      map: null as L.Map | null,
      geojsonLayer: null as L.GeoJSON | null,
      farms: [] as any[],
      isListVisible: false,
      loading: false,
      errorMessage: '',
      zoomControl: null as L.Control.Zoom | null,
      drawControl: null as L.Control.Draw | null,
      drawnItems: null as L.FeatureGroup | null,
      isDrawingMode: false,
      selectedFarm: null as any | null,
    };
  },
  mounted() {
    this.initMap();
    this.fetchFarms();
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([-15.7801, -47.9292], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

      const farmListButton = L.control({ position: 'topleft' });
      farmListButton.onAdd = () => {
        const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control farm-btn');
        button.innerHTML = '📋';
        button.title = 'Fazendas Cadastradas';
        button.onclick = this.toggleFarmList;
        return button;
      };
      farmListButton.addTo(this.map);

      const drawButton = L.control({ position: 'topleft' });
      drawButton.onAdd = () => {
        const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control draw-btn');
        button.innerHTML = '✏️';
        button.title = 'Desenhar Polígono';
        button.onclick = () => {
          if (!this.selectedFarm) {
            alert('Selecione uma fazenda primeiro');
            return;
          }
          this.toggleDrawingMode();
        };
        return button;
      };
      drawButton.addTo(this.map);

      this.drawnItems = new L.FeatureGroup();
      this.map.addLayer(this.drawnItems);
    },

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

    selectFarm(farm: any) {
      this.selectedFarm = farm;
      this.showFarmgeojson(farm);
    },

    showFarmgeojson(farm: { nome: string; parsedGeojson: any; cultura: string; produtividade: string | number }) {
      console.log('Exibindo fazenda:', farm);
      if (!this.map) return;
      
      if (this.drawnItems) {
        this.drawnItems.clearLayers();
      }
      
      if (farm.parsedGeojson) {
        try {
          if (this.geojsonLayer) {
            this.map.removeLayer(this.geojsonLayer);
          }

          this.geojsonLayer = L.geoJSON(farm.parsedGeojson, {
            style: {
              color: '#3388ff',
              weight: 3,
              opacity: 0.7,
              fillOpacity: 0.2,
              fillColor: '#3388ff'
            },
            onEachFeature: (feature, layer) => {
              const popupContent = `
                <div class="farm-popup">
                  <h4>${farm.nome}</h4>
                  <p><strong>Cultura:</strong> ${farm.cultura}</p>
                  <p><strong>Produtividade:</strong> ${farm.produtividade} <strong>sacas/ha:</strong></p>
                </div>
              `;
              layer.bindPopup(popupContent);
            }
          }).addTo(this.map);

          this.map.fitBounds(this.geojsonLayer.getBounds());
        } catch (error) {
          console.error('Erro ao exibir fazenda:', error);
          alert('Erro ao exibir a geometria da fazenda');
        }
      }
    },

    toggleFarmList() {
      this.isListVisible = !this.isListVisible;
    },

    toggleDrawingMode() {
      if (!this.map || !this.selectedFarm) return;
      
      this.isDrawingMode = !this.isDrawingMode;
      
      if (this.isDrawingMode) {

        if (this.drawnItems) {
          this.drawnItems.clearLayers();
        }

        if (this.geojsonLayer) {
          this.map.removeLayer(this.geojsonLayer);
          this.geojsonLayer = null;
        }
        
        this.drawControl = new L.Control.Draw({
          position: 'topright',
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: false, 
              metric: true,
              shapeOptions: {
                color: '#ff7800',
                fillColor: '#ff7800',
                fillOpacity: 0.2
              }
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
          },
          edit: {
            featureGroup: this.drawnItems
          }
        });
        
        this.map.addControl(this.drawControl);
        this.map.on(L.Draw.Event.CREATED, (e: any) => {
          if (this.drawnItems) {
            const layer = (e as L.DrawEvents.Created).layer;
            this.drawnItems.addLayer(layer);

            layer.bindPopup('Polígono desenhado. Clique em "Salvar" para confirmar.');
            layer.openPopup();
          }
        });
      } else {
        if (this.drawControl) {
          this.map.removeControl(this.drawControl);
          this.drawControl = null;
        }

        this.map.off(L.Draw.Event.CREATED);

        if (this.drawnItems) {
          this.drawnItems.clearLayers();
        }
        if (this.selectedFarm?.parsedGeojson) {
          this.showFarmgeojson(this.selectedFarm);
        }
      }
    },
    
    cancelDrawing() {
      this.isDrawingMode = false;
      this.toggleDrawingMode(); 
    },
    
    async saveDrawing() {
      if (!this.drawnItems || !this.selectedFarm) {
        alert('Nenhum polígono desenhado ou fazenda selecionada!');
        return;
      }
      
      const geoJSON = this.drawnItems.toGeoJSON();
      if (geoJSON.features.length === 0) {
        alert('Nenhum polígono desenhado!');
        return;
      }
      
      try {
        const payload = {
          geojson: JSON.stringify(geoJSON.features[0].geometry) 
        };

        const response = await fetch(`http://localhost:8080/areas/${this.selectedFarm.id}/geojson`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Erro ${response.status}`);
        }
        
        alert('Geometria salva com sucesso!');
        this.isDrawingMode = false;
        this.toggleDrawingMode();

        this.selectedFarm.parsedGeojson = geoJSON.features[0].geometry;
        this.showFarmgeojson(this.selectedFarm);
        
        await this.fetchFarms();
      } catch (error) {
        console.error('Erro ao salvar geometria:', error);
        alert(`Erro ao salvar a geometria: ${error.message}`);
      }
    }
  },
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
  z-index: 999;
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

#map {
  width: 100%;
  height: 100vh;
}

.error {
  color: red;
}

.leaflet-top {
  transition: transform 0.3s ease;
}

.leaflet-control-zoom {
  margin-left: 0;
  transition: transform 0.3s ease;
}

.farm-sidebar.open~#map .leaflet-top.leaflet-left .leaflet-control-zoom {
  transform: translateX(250px);
}

.farm-sidebar.open~#map .leaflet-top.leaflet-left .farm-btn,
.farm-sidebar.open~#map .leaflet-top.leaflet-left .draw-btn {
  transform: translateX(250px);
}

.leaflet-control {
  z-index: 1000 !important;
}

.farm-popup {
  min-width: 150px;
  font-family: Arial, sans-serif;
}

.farm-popup h4 {
  margin: 0 0 10px 0;
  color: #3388ff;
  font-size: 16px;
}

.farm-popup p {
  margin: 5px 0;
  font-size: 14px;
}

.farm-popup strong {
  color: #555;
}

.drawing-control-panel {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  text-align: center;
}

.drawing-control-panel h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.drawing-control-panel button {
  padding: 8px 15px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.drawing-control-panel .save-btn {
  background-color: #4CAF50;
  color: white;
}

.drawing-control-panel .cancel-btn {
  background-color: #f44336;
  color: white;
}

.drawing-control-panel .hint {
  margin: 10px 0 0 0;
  font-size: 0.9em;
  color: #666;
}

.leaflet-draw-toolbar a {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNTAgMTBjLTIyIDAtNDAgMTgtNDAgNDBzMTggNDAgNDAgNDAgNDAtMTggNDAtNDAtMTgtNDAtNDAtNDB6Ii8+PC9zdmc+') !important;
}

</style>