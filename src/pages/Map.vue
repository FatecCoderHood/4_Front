<template>
  <FarmsMenu :is-visible="showSidebar" @select-farm="selectFarm"></FarmsMenu >
  <div>
    <div id="map"></div>
    
    <div v-if="selectedFarm && isDrawingMode" class="drawing-control-panel">
      <h4>Editando: {{ selectedFarm.nome }}</h4>
      <button @click="saveDrawing" class="save-btn">Salvar Polígono</button>
      <button @click="cancelDrawing" class="cancel-btn">Cancelar</button>
      <p class="hint">Arraste os pontos para editar o polígono</p>
    </div>
  </div>
</template>

<script lang="ts">
import FarmsMenu from '@/components/FarmsMenu.vue';
import { defineComponent } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw';
import { components } from 'vuetify/dist/vuetify-labs.js';


export default defineComponent({
  data() {
    return {
      showSidebar: false,
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
      editableLayer: null as L.Layer | null,
      mapProviders: {
        osm: {
          name: 'OpenStreetMap',
          layer: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          })
        },
        satellite: {
          name: 'Satélite',
          layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Esri WorldImagery',
            maxZoom: 19
          })
        },
        terrain: {
          name: 'Terreno',
          layer: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenTopoMap',
            maxZoom: 17
          })
        }
      },
      currentMapProvider: 'osm'
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([-15.7801, -47.9292], 5);
      
      this.mapProviders[this.currentMapProvider].layer.addTo(this.map);

      const baseLayers = {
        "OpenStreetMap": this.mapProviders.osm.layer,
        "Satélite": this.mapProviders.satellite.layer,
        "Terreno": this.mapProviders.terrain.layer
      };
      
      L.control.layers(baseLayers, null, { position: 'topright' }).addTo(this.map);

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
        button.title = 'Editar Polígono';
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

    selectFarm(farm: any) {
      this.selectedFarm = farm;
      this.showFarmgeojson(farm);
    },

    toggleFarmList() {
      this.showSidebar = !this.showSidebar;
    },

    showFarmgeojson(farm: { nome: string; parsedGeojson: any; cultura: string; produtividade: string | number }) {
      console.log('Exibindo fazenda:', farm);
      if (!this.map) return;
      
      if (this.drawnItems) {
        this.drawnItems.clearLayers();
      }
      
      if (this.editableLayer) {
        this.map.removeLayer(this.editableLayer);
        this.editableLayer = null;
      }

      if (this.geojsonLayer) {
        this.map.removeLayer(this.geojsonLayer);
        this.geojsonLayer = null;
      }

      if (farm.parsedGeojson) {
        try {
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

    toggleDrawingMode() {
      if (!this.map || !this.selectedFarm) return;
      
      this.isDrawingMode = !this.isDrawingMode;
      
      if (this.isDrawingMode) {
        this.enterDrawingMode();
      } else {
        this.exitDrawingMode();
      }
    },
    
    enterDrawingMode() {
      if (!this.map || !this.selectedFarm || !this.drawnItems) return;
      
      this.drawnItems.clearLayers();
      
      if (this.geojsonLayer) {
        this.map.removeLayer(this.geojsonLayer);
        this.geojsonLayer = null;
      }
      
      if (this.selectedFarm.parsedGeojson) {
        this.editableLayer = L.geoJSON(this.selectedFarm.parsedGeojson, {
          style: {
            color: '#ff7800',
            weight: 3,
            opacity: 0.7,
            fillOpacity: 0.2,
            fillColor: '#ff7800'
          }
        });

        this.editableLayer.eachLayer((layer: L.Layer) => {
          this.drawnItems?.addLayer(layer);
          layer.bindPopup('Arraste os pontos para editar').openPopup();
        });
        
        this.map.fitBounds(this.editableLayer.getBounds());
      }
 
      this.drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
          polygon: false,
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false
        },
        edit: {
          featureGroup: this.drawnItems,
          edit: {
            selectedPathOptions: {
              maintainColor: true
            }
          }
        }
      });
      
      this.map.addControl(this.drawControl);
      
      this.map.on(L.Draw.Event.EDITED, (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: L.Layer) => {
          this.editableLayer = layer;
        });
      });
      
      setTimeout(() => {
        if (this.drawControl && this.drawnItems && this.drawnItems.getLayers().length > 0) {
          const editToolbar = (this.drawControl as any)._toolbars.edit;
          if (editToolbar && editToolbar._modes && editToolbar._modes.edit) {
            editToolbar._modes.edit.handler.enable();
          }
        }
      }, 100);
    },
    
    exitDrawingMode() {
      if (this.drawControl && this.map) {
        this.map.removeControl(this.drawControl);
      }

      this.map?.off(L.Draw.Event.EDITED);

      if (this.drawnItems) {
        this.drawnItems.clearLayers();
      }
      
      this.isDrawingMode = false;
      
      if (this.selectedFarm) {
        this.showFarmgeojson(this.selectedFarm);
      }
    },
    
    cancelDrawing() {
      this.exitDrawingMode();
    },
    
    async saveDrawing() {
      if (!this.drawnItems || !this.selectedFarm || !this.editableLayer) {
        alert('Nenhuma alteração no polígono foi feita!');
        return;
      }
      
      try {
        const geoJSON = (this.editableLayer as any).toGeoJSON();
        
        let geometryToSave = geoJSON;
        if (geoJSON.type === 'FeatureCollection' && geoJSON.features?.length > 0) {
          geometryToSave = geoJSON.features[0].geometry;
        } else if (geoJSON.type === 'Feature') {
          geometryToSave = geoJSON.geometry;
        }

        if (!geometryToSave?.coordinates || geometryToSave.coordinates.length === 0) {
          throw new Error('Geometria inválida para salvar');
        }

        const payload = {
          geojson: JSON.stringify(geometryToSave)
        };

        console.log('Enviando para o servidor:', payload);

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
        
        const result = await response.json();
        console.log('Resposta do servidor:', result);
        
        alert('Geometria salva com sucesso!');
        this.selectedFarm.parsedGeojson = geometryToSave;
        this.exitDrawingMode();
        this.showFarmgeojson(this.selectedFarm);
        
        await this.fetchFarms();
      } catch (error: any) {
        console.error('Erro ao salvar geometria:', error);
        alert(`Erro ao salvar a geometria: ${error.message || 'Erro desconhecido'}`);
      }
    }
  },
});
</script>

<style>
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

.leaflet-control-layers {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.leaflet-control-layers-toggle {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSIjMzMzIiBkPSJNNTAgMjBjLTE2LjUgMC0zMCAxMy41LTMwIDMwczEzLjUgMzAgMzAgMzAgMzAtMTMuNSAzMC0zMC0xMy41LTMwLTMwLTMwem0wIDUwYy0xMSAwLTIwLTktMjAtMjBzOS0yMCAyMC0yMCAyMCA5IDIwIDIwLTkgMjAtMjAgMjB6Ii8+PC9zdmc+') !important;
  width: 36px;
  height: 36px;
}

.leaflet-control-layers-expanded {
  padding: 10px;
}

.leaflet-control-layers label {
  display: block;
  margin: 5px 0;
  cursor: pointer;
}

.leaflet-control-layers-selector {
  margin-right: 5px;
}
</style>