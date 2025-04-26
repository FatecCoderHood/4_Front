<script lang="ts">
import { defineComponent, PropType } from 'vue';
import L from 'leaflet';
import { Farm, Talhao, GeoJsonData } from '@/types/farms';

export default defineComponent({
  name: 'GeoJSONLayer',
  props: {
    map: {
      type: Object as PropType<L.Map | null>,
      required: true
    },
    area: {
      type: Object as PropType<Farm & { talhoes: Talhao[] } | null>,
      default: null
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit-complete'],

  data() {
    return {
      geoJSONLayer: null as L.GeoJSON | null,
      drawnItems: null as L.FeatureGroup | null,
      drawControl: null as L.Control.Draw | null,
      currentHighlightedLayer: null as L.Layer | null
    };
  },

  watch: {
    area: {
      handler(newArea) {
        if (newArea) {
          this.displayGeoJSON(newArea);
        } else {
          this.clearLayers();
        }
      },
      immediate: true,
      deep: true
    },
    editable(newVal) {
      if (newVal) {
        this.enableEditing();
      } else {
        this.disableEditing();
      }
    }
  },

  methods: {
    displayGeoJSON(area: Farm & { talhoes: Talhao[] }): void {
      this.clearLayers();
      if (!this.map) return;

      area.talhoes?.forEach((talhao) => {
        if (talhao.coordinates || talhao.geojson) {
          const normalizedGeoJSON = this.normalizeGeoJSON(talhao.coordinates || talhao.geojson);
          if (normalizedGeoJSON) {
            this.addGeoJSONLayer(normalizedGeoJSON, area.nome, talhao);
          }
        }
      });
    },

    normalizeGeoJSON(geojson: any): GeoJsonData | null {
      try {
        if (typeof geojson === 'object' && geojson !== null) {
          return this.formatGeoJSONObject(geojson);
        }

        if (typeof geojson === 'string') {
          try {
            const parsed = JSON.parse(geojson);
            return this.formatGeoJSONObject(parsed);
          } catch (e) {
            return this.parseCustomGeoJSONString(geojson);
          }
        }

        console.warn('Formato GeoJSON não suportado:', geojson);
        return null;
      } catch (e) {
        console.warn('Erro ao normalizar GeoJSON:', e, 'Dados:', geojson);
        return null;
      }
    },

    formatGeoJSONObject(geojson: any): GeoJsonData | null {
      if (geojson.type === 'Feature' && geojson.geometry) {
        return {
          type: 'Feature',
          properties: geojson.properties || {},
          geometry: geojson.geometry
        };
      }

      if (geojson.type && geojson.coordinates) {
        return {
          type: 'Feature',
          properties: {},
          geometry: geojson
        };
      }

      console.warn('Formato de objeto GeoJSON não reconhecido:', geojson);
      return null;
    },

    parseCustomGeoJSONString(geojsonString: string): GeoJsonData | null {
      try {
        const jsonString = geojsonString
          .replace(/(\w+)=/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/"/g, '\\"')
          .replace(/\\"/g, '"')
          .replace(/([{\[,])\s*([^"\s]+)\s*:/g, '$1"$2":')
          .replace(/:\s*([^"\s{}\[\],]+)([,\]}])/g, ':"$1"$2');

        const parsed = JSON.parse(jsonString);
        return this.formatGeoJSONObject(parsed);
      } catch (e) {
        console.warn('Falha ao analisar string GeoJSON personalizada:', geojsonString, 'Erro:', e);
        return null;
      }
    },

    createPopupContent(areaName: string, talhao?: Talhao): string {
      return `
        <div class="farm-popup" style="min-width: 200px; padding: 10px;">
          ${areaName ? `<h4 style="margin: 0 0 10px 0; color: #2c3e50;">${areaName}</h4>` : ''}
          ${talhao?.mnTl ? `<p style="margin: 5px 0;"><strong>Talhão:</strong> ${talhao.mnTl}</p>` : ''}
          ${talhao?.cultura ? `<p style="margin: 5px 0;"><strong>Cultura:</strong> ${talhao.cultura}</p>` : ''}
          ${talhao?.areaHaTl ? `<p style="margin: 5px 0;"><strong>Área:</strong> ${talhao.areaHaTl} ha</p>` : ''}
          ${talhao?.safra ? `<p style="margin: 5px 0;"><strong>Safra:</strong> ${talhao.safra}</p>` : ''}
        </div>
      `;
    },

    addGeoJSONLayer(geojson: GeoJsonData, areaName: string, talhao?: Talhao): void {
      try {
        const layer = L.geoJSON(geojson, {
          style: {
            color: '#3388ff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.2,
            fillColor: '#3388ff'
          },
          onEachFeature: (feature, layer) => {
            layer.options.interactive = true;
            
            const popupContent = this.createPopupContent(areaName, talhao);
            layer.bindPopup(popupContent, {
              closeButton: true,
              autoClose: false,
              closeOnClick: false,
              className: 'custom-popup',
              maxWidth: 300
            });

            layer.on({
              click: (e) => {
                // Fecha o popup anterior se existir
                if (this.currentHighlightedLayer && this.currentHighlightedLayer !== layer) {
                  (this.currentHighlightedLayer as any).closePopup();
                }
                
                layer.openPopup(e.latlng);
                this.currentHighlightedLayer = layer;
                
                // Destaca a camada clicada
                layer.setStyle({
                  weight: 5,
                  color: '#ff7800',
                  fillOpacity: 0.5
                });
              },
              mouseover: () => {
                if (layer !== this.currentHighlightedLayer) {
                  layer.setStyle({ 
                    weight: 5,
                    fillOpacity: 0.4 
                  });
                }
              },
              mouseout: () => {
                if (layer !== this.currentHighlightedLayer) {
                  layer.setStyle({ 
                    weight: 3,
                    fillOpacity: 0.2,
                    color: '#3388ff'
                  });
                }
              }
            });
          }
        });

        if (this.map) {
          if (!this.geoJSONLayer) {
            this.geoJSONLayer = layer;
            this.map.addLayer(layer);
          } else {
            this.geoJSONLayer.addLayer(layer);
          }
          
          this.map.fitBounds(layer.getBounds(), { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Erro ao adicionar camada GeoJSON:', error);
      }
    },

    enableEditing(): void {
      if (!this.map || !this.geoJSONLayer) return;

      this.drawnItems = new L.FeatureGroup();
      this.map.addLayer(this.drawnItems);

      this.geoJSONLayer.eachLayer((layer: L.Layer) => {
        this.drawnItems?.addLayer(layer);
        layer.bindPopup('Arraste os pontos para editar').openPopup();
      });

      this.drawControl = new L.Control.Draw({
        edit: {
          featureGroup: this.drawnItems
        },
        draw: false
      });

      this.map.addControl(this.drawControl);

      this.map.on(L.Draw.Event.EDITED, (e) => {
        const layers = e.layers;
        layers.eachLayer(() => {
          this.$emit('edit-complete', this.drawnItems?.toGeoJSON());
        });
      });
    },

    disableEditing(): void {
      if (this.drawControl && this.map) {
        this.map.removeControl(this.drawControl);
      }
      if (this.drawnItems) {
        this.drawnItems.clearLayers();
      }
      this.map?.off(L.Draw.Event.EDITED);
    },

    clearLayers(): void {
      if (this.geoJSONLayer) {
        this.map?.removeLayer(this.geoJSONLayer);
        this.geoJSONLayer = null;
      }
      this.disableEditing();
      this.currentHighlightedLayer = null;
    }
  },

  beforeUnmount(): void {
    this.clearLayers();
    if (this.drawControl && this.map) {
      this.map.removeControl(this.drawControl);
    }
    if (this.drawnItems) {
      this.map?.removeLayer(this.drawnItems);
    }
  }
});
</script>

<style>
.custom-popup {
  font-family: Arial, sans-serif;
}
.custom-popup .leaflet-popup-content-wrapper {
  border-radius: 8px;
  box-shadow: 0 3px 14px rgba(0,0,0,0.2);
  padding: 1px;
}
.custom-popup .leaflet-popup-content {
  margin: 8px 12px;
}
.custom-popup .leaflet-popup-tip {
  background: white;
}
.farm-popup h4 {
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
</style>

<template>
  <div></div>
</template>