<template>
  <button 
    class="weeds-toggle-btn" 
    :class="{ 'btn-closed': !sidebarOpen, 'active': showWeedsOverlay }"
    @click="toggleWeedsOverlay"
    title="Mostrar/ocultar ervas daninhas"
  >
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      <circle cx="12" cy="12" r="5" :fill="showWeedsOverlay ? '#4CAF50' : 'none'"/>
    </svg>
  </button>
</template>




<script lang="ts">
import { defineComponent, PropType } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { WeedFeature, Talhao, WeedsOverlayState } from '@/types/weeds';

export default defineComponent({
  name: 'WeedsOverlay',
  props: {
    map: {
      type: Object as PropType<L.Map>,
      required: true
    },
    talhoes: {
      type: Array as PropType<Talhao[]>,
      required: true
    },
    sidebarOpen: {
      type: Boolean,
      default: false
    },
    weedsData: {
      type: Array as PropType<WeedFeature[]>,
      default: () => []
    }
  },
  data(): WeedsOverlayState {
    return {
      showWeedsOverlay: false,
      weedsLayers: [],
      hasValidBounds: false
    };
  },
  methods: {
    normalizeWeedsData(weeds: WeedFeature[]): WeedFeature[] {
      return weeds.map(weed => {
        try {
          if (typeof weed.properties.CLASSE === 'string' && 
              weed.properties.CLASSE.includes('type=Feature')) {
            
            // Improved JSON string cleaning
            let jsonStr = weed.properties.CLASSE
              .replace(/(\w+)=/g, '"$1":')  // Convert key=value to "key":value
              .replace(/'/g, '"')           // Replace single quotes
              .replace(/([{\[,])\s*([a-zA-Z0-9_]+):/g, '$1"$2":') // Ensure keys are quoted
              .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)([,\]}])/g, ':"$1"$2'); // Wrap unquoted values

            // Handle special cases in the string
            jsonStr = jsonStr.replace(/:\s*([a-zA-Z]+)\s*([,\}])/g, ':"$1"$2');

            const embeddedData = JSON.parse(jsonStr);
            
            return {
              ...weed,
              geometry: embeddedData.geometry || weed.geometry,
              properties: {
                ...weed.properties,
                CLASSE: embeddedData.properties?.CLASSE || weed.properties.CLASSE,
                AREA_M2: embeddedData.properties?.AREA_M2 || weed.properties.AREA_M2,
                NM_TL: embeddedData.properties?.NM_TL || weed.properties.NM_TL
              }
            };
          }
          return weed;
        } catch (e) {
          console.error('Erro ao normalizar feature:', e, '\nDados problemáticos:', weed.properties.CLASSE);
          return {
            ...weed,
            properties: {
              ...weed.properties,
              CLASSE: 'ERRO_NORMALIZACAO'
            }
          };
        }
      });
    },

    toggleWeedsOverlay(): void {
      this.showWeedsOverlay = !this.showWeedsOverlay;
      console.log(`[TOGGLE] showWeedsOverlay: ${this.showWeedsOverlay}`);

      if (this.showWeedsOverlay) {
        console.log('[TOGGLE] Exibindo ervas daninhas...');
        this.showWeedsOnMap();
      } else {
        console.log('[TOGGLE] Ocultando ervas daninhas...');
        this.hideWeedsFromMap();
      }
    },

    showWeedsOnMap(): void {
      if (!this.map) {
        console.error('[SHOW] Mapa não disponível');
        return;
      }

      if (!this.weedsData?.length) {
        console.warn('[SHOW] Nenhum dado de ervas disponível');
        return;
      }

      // Normaliza os dados com tratamento robusto
      const normalizedData = this.normalizeWeedsData(this.weedsData);
      console.log(`[SHOW] Processando ${normalizedData.length} ervas daninhas`);

      // Verificação de dados normalizados
      const failedNormalizations = normalizedData.filter(f => 
        f.properties.CLASSE === 'ERRO_NORMALIZACAO' || 
        typeof f.properties.CLASSE === 'string' && f.properties.CLASSE.includes('type=Feature')
      );

      if (failedNormalizations.length > 0) {
        console.warn(`[SHOW] ${failedNormalizations.length} features não foram normalizadas corretamente`);
        console.log('[SHOW] Exemplo de feature não normalizado:', failedNormalizations[0]);
      }

      // DEBUG: Log detalhado
      if (normalizedData.length > 0) {
        const sampleFeature = normalizedData.find(f => f.properties.CLASSE !== 'ERRO_NORMALIZACAO');
        if (sampleFeature) {
          console.log('[DEBUG] Feature normalizado com sucesso:', {
            classe: sampleFeature.properties.CLASSE,
            coordinates: sampleFeature.geometry.coordinates
          });
        }
      }

      this.hideWeedsFromMap();
      this.hasValidBounds = false;
      let globalBounds: L.LatLngBounds | null = null;

      // Agrupar por talhão usando dados normalizados
      const weedsByTalhao = this.groupWeedsByTalhao(normalizedData);
      console.log('[SHOW] Ervas agrupadas por talhão:', Object.keys(weedsByTalhao).length);

      // Processar em lotes para melhor performance
      Object.entries(weedsByTalhao).forEach(([talhaoId, features]) => {
        const talhaoLayer = L.layerGroup();
        
        features.forEach((feature, index) => {
          try {
            const geoJSON = L.geoJSON(feature, {
              style: this.getWeedStyle(feature),
              onEachFeature: (feature, layer) => {
                layer.bindPopup(this.createPopupContent(feature, talhaoId));
                
                // Atualizar bounds totais
                if (layer.getBounds) {
                  const layerBounds = layer.getBounds();
                  if (!globalBounds) {
                    globalBounds = L.latLngBounds(layerBounds);
                  } else {
                    globalBounds.extend(layerBounds);
                  }
                }
              }
            });
            
            talhaoLayer.addLayer(geoJSON);
            console.log(`[SHOW] Camada ${index} adicionada ao talhão ${talhaoId}`);
          } catch (error) {
            console.error(`[SHOW] Erro ao criar camada ${index}:`, error);
          }
        });

        // Adicionar ao mapa e guardar referência
        this.map.addLayer(talhaoLayer);
        this.weedsLayers.push(talhaoLayer);
      });

      // Ajustar viewport para mostrar todas as ervas
      if (globalBounds && globalBounds.isValid()) {
        this.hasValidBounds = true;
        this.map.fitBounds(globalBounds, { 
          padding: [50, 50],
          maxZoom: 15
        });
        console.log('[SHOW] Viewport ajustado para:', globalBounds);
      } else {
        console.warn('[SHOW] Não foi possível ajustar o viewport - bounds inválido');
      }
    },

    groupWeedsByTalhao(weedsData: WeedFeature[]): Record<string, WeedFeature[]> {
      return weedsData.reduce((acc, feature) => {
        const talhaoId = feature.properties.NM_TL.toString();
        acc[talhaoId] = acc[talhaoId] || [];
        acc[talhaoId].push(feature);
        return acc;
      }, {} as Record<string, WeedFeature[]>);
    },

    getWeedStyle(feature: WeedFeature): L.PathOptions {
      const typeColors: Record<string, string> = {
        'amargoso': '#ff0000',
        'buva': '#00ff00', 
        'caruru': '#0000ff',
        'daninha': '#ff9900',
        'erro_normalizacao': '#ff00ff',
        'default': '#cccccc'
      };

      const classe = feature.properties.CLASSE.toLowerCase();
      return {
        fillColor: typeColors[classe] || typeColors.default,
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9
      };
    },

    createPopupContent(feature: WeedFeature, talhaoId: string): string {
      const talhao = this.talhoes.find(t => 
        t.id.toString() === talhaoId || t.mnTl?.toString() === talhaoId
      );
      
      return `
        <div class="weed-popup">
          <p><strong>Erva:</strong> ${feature.properties.CLASSE}</p>
          <p><strong>Área:</strong> ${(feature.properties.AREA_M2 / 10000).toFixed(4)} ha</p>
          ${feature.properties.CLASSE === 'ERRO_NORMALIZACAO' ? 
            '<p style="color:red"><strong>Erro:</strong> Dados não normalizados</p>' : ''}
        </div>
      `;
    },

    hideWeedsFromMap(): void {
      if (!this.map) return;
      
      console.log(`[HIDE] Removendo ${this.weedsLayers.length} camadas`);
      
      this.weedsLayers.forEach(layer => {
        try {
          this.map.removeLayer(layer);
        } catch (error) {
          console.error('[HIDE] Erro ao remover camada:', error);
        }
      });
      
      this.weedsLayers = [];
      this.hasValidBounds = false;
    }
  },
  mounted() {
    console.log('[MOUNT] WeedsOverlay montado com', this.weedsData.length, 'ervas');
    if (this.weedsData.length > 0) {
      console.log('[DEBUG] Exemplo de dados recebidos:', {
        classe: this.weedsData[0].properties.CLASSE,
        geometry: this.weedsData[0].geometry
      });
    }
  },
  beforeUnmount() {
    this.hideWeedsFromMap();
  }
});
</script>

<style scoped>
.weeds-toggle-btn {
  position: absolute;
  left: 246px;
  top: 108px;
  width: 36px;
  height: 36px;
  background: #F1FAFC;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 1002;
  border: none;
  cursor: pointer;
  transition: left 0.3s ease, background-color 0.3s;
}

.weeds-toggle-btn.btn-closed {
  left: 10px;
}

.weeds-toggle-btn.active {
  background-color: #e0f7fa;
  border: 2px solid #4CAF50;
}

.weeds-toggle-btn svg {
  fill: #333;
}

.weeds-toggle-btn:hover {
  background: #e0f0f0;
}

.weeds-toggle-btn.active:hover {
  background-color: #b2ebf2;
}
</style>

<style>
.weed-popup {
  font-family: Arial, sans-serif;
  min-width: 200px;
}
.weed-popup h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}
.weed-popup p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}
.weed-popup strong {
  color: #333;
}
.weed-popup .error-message {
  color: red;
  font-weight: bold;
}
</style>