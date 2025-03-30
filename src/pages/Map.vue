<route>
  {
    "meta": {
      "title": "Mapa"
    }
  }
</route>

<template>
  <div>
    <div :class="['farm-sidebar', { 'open': isListVisible }]">
      <h3>Fazendas Cadastradas</h3>
      <p v-if="loading">Carregando...</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="!loading && !errorMessage && farms.length === 0">Nenhuma fazenda cadastrada.</p>
      <ul v-if="!loading && !errorMessage && farms.length > 0">
        <li v-for="farm in farms" :key="farm.id">
          <button @click="showFarmgeojson(farm)">
            <strong>{{ farm.nome }}</strong><br>
            <small>{{ farm.localizacao }} • {{ farm.cultura }}</small>
          </button>
        </li>
      </ul>
    </div>

    <div id="map"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

    showFarmgeojson(farm: { nome: string; parsedGeojson: any; cultura: string; produtividade: string | number }) {
      console.log('Exibindo fazenda:', farm); // Para debug
      if (!this.map) return;
      if (!farm.parsedGeojson) {
        alert('Esta fazenda não possui geometria válida.');
        return;
      }

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
                <p><strong>Produtividade:</strong> ${farm.produtividade}</p>
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
    },

    toggleFarmList() {
      this.isListVisible = !this.isListVisible;
    },
  },
});
</script>

<style>
.farm-btn {
  background: white;
  border: none;
  padding: 6px;
  font-size: 18px;
  cursor: pointer;
}

.farm-btn:hover {
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

.farm-sidebar.open~#map .leaflet-top.leaflet-left .farm-btn {
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
</style>