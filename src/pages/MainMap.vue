<route>
  {
    "meta": {
      "title": "MainMap"
    }
  }
</route>

<script setup lang="ts">
import L, { LatLngExpression, Polygon, polygon } from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet/dist/leaflet.css';
import { onMounted, ref } from 'vue';

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let polygonPoints: LatLngExpression[] = [];
let polygonLayer: Polygon | null = null;
let clickCount = 0; // Adiciona o contador de cliques
let savedPolygons: { polygon: Polygon, text: string }[] = []; // Array para armazenar polígonos salvos com texto
let selectedPolygon: { polygon: Polygon, text: string } | null = null; // Polígono selecionado

onMounted(() => {
  if (mapContainer.value) {
    map = L.map(mapContainer.value).setView([-10, -55] as LatLngExpression, 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.Control.geocoder().addTo(map);

    // Modifica para adicionar marcador com dois cliques
    map.on('click', (e: L.LeafletMouseEvent) => {
      clickCount++;

      if (clickCount === 2) {
        L.marker(e.latlng).addTo(map)
          .bindPopup('Novo marcador adicionado aqui')
          .on('click', (event: L.LeafletMouseEvent) => {
            if (map) {
              map.removeLayer(event.target);
            }
          });
        clickCount = 0; // Reseta o contador de cliques
      }
    });

    // Evento mousemove para adicionar pontos ao polígono (Ctrl + mouse move)
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (e.originalEvent.ctrlKey) {
        polygonPoints.push(e.latlng);
        if (polygonLayer) {
          map.removeLayer(polygonLayer);
        }
        polygonLayer = polygon(polygonPoints).addTo(map);
      }
    });

    // Evento para salvar o polígono com um clique
    map.on('click', () => {
      if (polygonLayer) {
        const newPolygon = { polygon: polygonLayer, text: '' };
        savedPolygons.push(newPolygon);
        polygonPoints = [];
        polygonLayer = null;

        // Adiciona evento de clique para exibir pop-up e selecionar o polígono
        newPolygon.polygon.on('click', (e) => {
          if (e.originalEvent.ctrlKey) {
            // Remove o polígono se a tecla Ctrl estiver pressionada
            if (map) {
              map.removeLayer(newPolygon.polygon);
              savedPolygons = savedPolygons.filter(p => p !== newPolygon);
              selectedPolygon = null;
            }
          } else {
            // Exibe o pop-up se a tecla Ctrl não estiver pressionada
            selectedPolygon = newPolygon;
            const text = prompt('Digite o texto para o polígono:');
            if (text) {
              newPolygon.text = text;
              newPolygon.polygon.bindPopup(text + '<br><button id="removePolygon">Remover</button>').openPopup();

              // Adiciona evento de clique para remover o polígono
              const removeButton = document.getElementById('removePolygon');
              if (removeButton) {
                removeButton.addEventListener('click', () => {
                  if (map) {
                    map.removeLayer(newPolygon.polygon);
                    savedPolygons = savedPolygons.filter(p => p !== newPolygon);
                    selectedPolygon = null;
                  }
                });
              }
            }
          }
        });
      }
    });

    // Evento para limpar o polígono ao soltar a tecla Ctrl
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        polygonPoints = [];
        if (polygonLayer) {
          map.removeLayer(polygonLayer);
          polygonLayer = null;
        }
      }
    });

    // Evento de teclado para exibir pop-up com a tecla "p"
    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' && selectedPolygon) {
        const text = prompt('Digite o texto para o polígono:');
        if (text) {
          selectedPolygon.text = text;
          selectedPolygon.polygon.bindPopup(text + '<br><button id="removePolygon">Remover</button>').openPopup();

          // Adiciona evento de clique para remover o polígono
          const removeButton = document.getElementById('removePolygon');
          if (removeButton) {
            removeButton.addEventListener('click', () => {
              if (map) {
                map.removeLayer(selectedPolygon.polygon);
                savedPolygons = savedPolygons.filter(p => p !== selectedPolygon);
                selectedPolygon = null;
              }
            });
          }
        }
      }
    });
  }
});
</script>

<template>
  <div>
    <div class="map-container">
      <div class="map-header">MAPA DE ÁREAS CADASTRADAS</div>
      <div class="map-content" ref="mapContainer"></div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 656.4px;
  height: 454.8px;
  border-radius: 18px;
  background: rgba(41, 52, 62, 1);
  overflow: hidden;
  position: relative;
  left: 72px;
  top: 72px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.map-header {
  color: white;
  text-align: center;
  font-weight: bold;
  padding-bottom: 12px;
}

.map-content {
  flex: 1;
  background-color: white;
  border-radius: 6px;
}
</style>

