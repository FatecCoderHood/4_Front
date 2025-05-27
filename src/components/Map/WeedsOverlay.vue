<template>

  <div>
    <!-- Botão de ervas daninhas -->
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

    <!-- Botão de edição (novo) -->
    <button 
      class="edit-weeds-btn"
      :class="{ 
        'btn-closed': !sidebarOpen, 
        'active': showWeedsOverlay,
        'disabled': !showWeedsOverlay
      }"
      @click="handleEditWeeds"
      title="Editar ervas daninhas"
      :disabled="!showWeedsOverlay"
    >
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
    </button>

    <!-- Modal de edição ajustado -->
    <div v-if="showEditModal" class="edit-modal-overlay">
      <div class="edit-modal">
        <div class="modal-header">
          <h3>Edição de Ervas Daninhas</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="tool-selection">
            <button 
              @click="setTool('draw')" 
              :class="{ 'active': activeTool === 'draw' }"
              title="Desenhar nova área de ervas daninhas"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
                  :fill="activeTool === 'draw' ? '#2196F3' : 'currentColor'"/>
              </svg>
              Desenhar
            </button>
            
            <button 
              @click="setTool('erase')" 
              :class="{ 'active': activeTool === 'erase' }"
              title="Apagar ervas daninhas dentro da área"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M7 11h10v2H7z" :fill="activeTool === 'erase' ? '#F44336' : 'currentColor'"/>
              </svg>
              Apagar
            </button>
          </div>
          
          <div class="instructions">
            <p v-if="activeTool === 'draw'">
              Desenhe um polígono no mapa para adicionar uma nova área de ervas daninhas.
            </p>
            <p v-if="activeTool === 'erase'">
              Desenhe um polígono no mapa para remover as ervas daninhas dentro da área.
            </p>
          </div>
          
          <div class="action-buttons">
            <button @click="confirmAction" class="confirm-btn" :disabled="!drawnPolygon">
              {{ activeTool === 'draw' ? 'Adicionar Área' : 'Remover Ervas' }}
            </button>
            <button @click="clearDrawing" class="clear-btn" :disabled="!drawnPolygon">
              Limpar Desenho
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, onBeforeUnmount } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import type { WeedFeature, Talhao, WeedsOverlayState } from '@/types/weeds';
import axios from 'axios';

type ToolMode = 'draw' | 'erase' | null;

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
    },
    areaId: {
      type: Number,
      required: true,
      validator: (value: number) => {
        if (value === undefined || value === null || isNaN(value) || value <= 0) {
          console.error('ID da área inválido:', value);
          return false;
        }
        return true;
      }
    },
    talhaoId: {
      type: Number,
      required: true,
      validator: (value: number) => {
        if (value === undefined || value === null || isNaN(value) || value <= 0) {
          console.error('ID do talhão inválido:', value);
          return false;
        }
        return true;
      }
    }
  },
  data(): WeedsOverlayState & {
    showEditModal: boolean;
    activeTool: ToolMode;
    drawnPolygon: L.Polygon | null;
    drawControl: L.Control.Draw | null;
    drawnItems: L.FeatureGroup | null;
    isMapInitialized: boolean;
    drawHandler: L.Draw.Polygon | null;
  } {
    return {
      showWeedsOverlay: false,
      weedsLayers: [],
      hasValidBounds: false,
      showEditModal: false,
      activeTool: null,
      drawnPolygon: null,
      drawControl: null,
      drawnItems: null,
      isMapInitialized: false,
      drawHandler: null,
      editOptions: {
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e100',
              message: '<strong>Erro:<strong> o polígono não pode se cruzar!'
            },
            shapeOptions: {
              color: '#2196F3',
              fillColor: '#2196F3',
              fillOpacity: 0.3
            }
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false
        },
        edit: {
          featureGroup: null as L.FeatureGroup | null,
          remove: false
        }
      }
    };
  },
  watch: {
    showEditModal(newVal) {
      if (newVal) {
        this.initDrawing();
      } else {
        this.cleanupDrawing();
      }
    },
    activeTool(newTool) {
      if (newTool) {
        this.startDrawingTool(newTool);
      } else {
        this.disableDrawingTool();
      }
    }
  },

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
            

            let jsonStr = weed.properties.CLASSE
              .replace(/(\w+)=/g, '"$1":')
              .replace(/'/g, '"')
              .replace(/([{\[,])\s*([a-zA-Z0-9_]+):/g, '$1"$2":')
              .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)([,\]}])/g, ':"$1"$2');


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


    handleEditWeeds(): void {
      if (!this.showWeedsOverlay) return;
      
      this.showEditModal = true;
      console.log('[EDIT] Modal de edição aberto');
    },

    initDrawing() {
      if (!this.map || this.isMapInitialized) return;

      try {
        this.drawnItems = L.featureGroup().addTo(this.map);
        this.editOptions.edit.featureGroup = this.drawnItems;
        this.drawControl = new L.Control.Draw(this.editOptions);
        this.isMapInitialized = true;
      } catch (error) {
        console.error('Erro ao inicializar ferramentas de desenho:', error);
      }
    },
    
    startDrawingTool(tool: ToolMode) {
      if (!this.map || !this.drawnItems || !this.drawControl) return;

      this.clearDrawing();
      this.activeTool = tool;

      if (tool === 'draw') {
        this.drawHandler = new L.Draw.Polygon(this.map, this.editOptions.draw.polygon);
      } else if (tool === 'erase') {
        const eraseOptions = {
          ...this.editOptions.draw.polygon,
          shapeOptions: {
            color: '#F44336',
            fillColor: '#F44336',
            fillOpacity: 0.3
          }
        };
        this.drawHandler = new L.Draw.Polygon(this.map, eraseOptions);
      }

      if (this.drawHandler) {
        this.drawHandler.enable();
      }

      this.map.on(L.Draw.Event.CREATED, this.handleDrawCreated);
      this.map.on(L.Draw.Event.DRAWSTART, this.handleDrawStart);
    },
    
    disableDrawingTool() {
      if (this.drawHandler) {
        this.drawHandler.disable();
        this.drawHandler = null;
      }
      
      if (this.map) {
        this.map.off(L.Draw.Event.CREATED, this.handleDrawCreated);
        this.map.off(L.Draw.Event.DRAWSTART, this.handleDrawStart);
      }
    },
    
    cleanupDrawing() {
      if (!this.map) return;

      try {
        this.disableDrawingTool();
        this.activeTool = null;

        if (this.drawnItems) {
          this.drawnItems.clearLayers();
          this.map.removeLayer(this.drawnItems);
          this.drawnItems = null;
        }

        if (this.drawControl) {
          this.drawControl = null;
        }

        this.drawnPolygon = null;
        this.isMapInitialized = false;
      } catch (error) {
        console.error('Erro ao limpar ferramentas de desenho:', error);
      }
    },
    
    setTool(tool: ToolMode) {
      this.activeTool = tool;
    },
    
    handleDrawStart() {
      this.clearDrawing();
    },
    
    handleDrawCreated(e: L.DrawEvents.Created) {
      try {
        const layer = e.layer;
        this.drawnItems?.addLayer(layer);
        
        if (layer instanceof L.Polygon) {
          this.drawnPolygon = layer;
        }
      } catch (error) {
        console.error('Erro ao criar desenho:', error);
      }
    },
    
    clearDrawing() {
      try {
        if (this.drawnItems) {
          this.drawnItems.clearLayers();
        }
        this.drawnPolygon = null;
      } catch (error) {
        console.error('Erro ao limpar desenho:', error);
      }
    },
    
    async confirmAction() {
      if (!this.drawnPolygon || !this.activeTool || !this.map) {
        console.error('Polígono, ferramenta ou mapa não definido');
        this.$emit('weeds-error', 'Desenho inválido ou ferramenta não selecionada');
        return;
      }

      try {
        // Desativa animações para evitar erros
        this.map.options.zoomAnimation = false;
        this.map.options.fadeAnimation = false;
        
        // Converte o Proxy para um array simples
        const drawnPolygonLatLngs = JSON.parse(JSON.stringify(this.drawnPolygon.getLatLngs()[0]));

        if (this.activeTool === 'draw') {
          console.log('Adicionando nova área de ervas daninhas:', drawnPolygonLatLngs);
          await this.addWeeds(drawnPolygonLatLngs);
          this.$emit('add-weeds-success');
        } else if (this.activeTool === 'erase') {
          console.log('Removendo ervas daninhas');
          await this.removeWeeds();
          this.$emit('remove-weeds-success');
        }

        this.clearDrawing();
        this.activeTool = null;
        this.closeModal();
        this.$emit('weeds-updated');
      } catch (error: any) {
        console.error('Erro ao confirmar ação:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Erro desconhecido';
        this.$emit('weeds-error', errorMsg);
      } finally {
        // Restaura animações
        if (this.map) {
          this.map.options.zoomAnimation = true;
          this.map.options.fadeAnimation = true;
        }
      }
    },

    async addWeeds(polygonLatLngs: L.LatLng[]) {
      if (!this.areaId || !this.talhaoId || isNaN(this.areaId) || isNaN(this.talhaoId) || this.areaId <= 0 || this.talhaoId <= 0) {
        const errorMsg = 'Área ou talhão não selecionados ou inválidos';
        console.error(errorMsg, { areaId: this.areaId, talhaoId: this.talhaoId });
        throw new Error(errorMsg);
      }

      try {
        const polygon = L.polygon(polygonLatLngs);
        const geoJSON = polygon.toGeoJSON();
        
        geoJSON.properties = {
          CLASSE: 'daninha',
          AREA_M2: this.calculateArea(polygonLatLngs),
          NM_TL: this.talhaoId.toString()
        };

        console.log('Enviando dados para o backend:', {
          areaId: this.areaId,
          talhaoId: this.talhaoId,
          geoJSON
        });

        const response = await axios.put(
          `http://localhost:8080/areas/${this.areaId}/talhoes/${this.talhaoId}/ervas`,
          geoJSON,
          {
            validateStatus: () => true
          }
        );

        if (response.status >= 400) {
          throw new Error(response.data?.message || `Erro ${response.status} ao adicionar ervas`);
        }

        console.log('Ervas adicionadas com sucesso:', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro detalhado ao adicionar ervas:', {
          error: error instanceof Error ? error.message : String(error),
          areaId: this.areaId,
          talhaoId: this.talhaoId,
          polygon: polygonLatLngs
        });
        throw error;
      }
    },

    async removeWeeds() {
      if (!this.areaId || !this.talhaoId || isNaN(this.areaId) || isNaN(this.talhaoId) || this.areaId <= 0 || this.talhaoId <= 0) {
        const errorMsg = 'Área ou talhão não selecionados ou inválidos';
        console.error(errorMsg, { areaId: this.areaId, talhaoId: this.talhaoId });
        throw new Error(errorMsg);
      }

      try {
        console.log('Enviando requisição para remover ervas:', {
          areaId: this.areaId,
          talhaoId: this.talhaoId
        });

        const response = await axios.delete(
          `http://localhost:8080/areas/${this.areaId}/talhoes/${this.talhaoId}/ervas`,
          {
            validateStatus: () => true
          }
        );

        if (response.status >= 400) {
          throw new Error(response.data?.message || `Erro ${response.status} ao remover ervas`);
        }

        console.log('Ervas removidas com sucesso:', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro detalhado ao remover ervas:', {
          error: error instanceof Error ? error.message : String(error),
          areaId: this.areaId,
          talhaoId: this.talhaoId
        });
        throw error;
      }
    },

    calculateArea(latLngs: L.LatLng[]): number {
      if (latLngs.length < 3) return 0;
      
      let area = 0;
      const earthRadius = 6378137;
      const lng2rad = (lng: number) => lng * Math.PI / 180;
      const lat2rad = (lat: number) => lat * Math.PI / 180;

      for (let i = 0; i < latLngs.length; i++) {
        const p1 = latLngs[i];
        const p2 = latLngs[(i + 1) % latLngs.length];

        const φ1 = lat2rad(p1.lat);
        const φ2 = lat2rad(p2.lat);
        const Δλ = lng2rad(p2.lng - p1.lng);

        area += Δλ * (2 + Math.sin(φ1) + Math.sin(φ2));
      }

      area = Math.abs(area * earthRadius * earthRadius / 2);
      return area;
    },
    
    isLayerInsidePolygon(layer: L.Layer, polygonLatLngs: L.LatLng[]): boolean {
      if (layer instanceof L.Marker) {
        return this.isPointInPolygon(layer.getLatLng(), polygonLatLngs);
      } else if (layer instanceof L.Polygon) {
        const layerLatLngs = layer.getLatLngs()[0];
        return layerLatLngs.every(latLng => this.isPointInPolygon(latLng, polygonLatLngs));
      }
      return false;
    },
    
    isPointInPolygon(point: L.LatLng, polygon: L.LatLng[]): boolean {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng;
        const xj = polygon[j].lat, yj = polygon[j].lng;
        
        const intersect = ((yi > point.lng) !== (yj > point.lng))
          && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
        
        if (intersect) inside = !inside;
      }
      return inside;
    },
    
    closeModal() {
      this.showEditModal = false;
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


      try {
        const normalizedData = this.normalizeWeedsData(this.weedsData);
        console.log(`[SHOW] Processando ${normalizedData.length} ervas daninhas`);

        const failedNormalizations = normalizedData.filter(f => 
          f.properties.CLASSE === 'ERRO_NORMALIZACAO' || 
          typeof f.properties.CLASSE === 'string' && f.properties.CLASSE.includes('type=Feature')
        );

        if (failedNormalizations.length > 0) {
          console.warn(`[SHOW] ${failedNormalizations.length} features não foram normalizadas corretamente`);
        }

        this.hideWeedsFromMap();
        this.hasValidBounds = false;
        let globalBounds: L.LatLngBounds | null = null;

        const weedsByTalhao = this.groupWeedsByTalhao(normalizedData);
        console.log('[SHOW] Ervas agrupadas por talhão:', Object.keys(weedsByTalhao).length);

        Object.entries(weedsByTalhao).forEach(([talhaoId, features]) => {
          const talhaoLayer = L.layerGroup();
          
          features.forEach((feature, index) => {
            try {
              const geoJSON = L.geoJSON(feature, {
                style: this.getWeedStyle(feature),
                onEachFeature: (feature, layer) => {
                  layer.bindPopup(this.createPopupContent(feature, talhaoId));
                  
                  if (layer.getBounds) {
                    const layerBounds = layer.getBounds();
                    globalBounds = globalBounds ? globalBounds.extend(layerBounds) : L.latLngBounds(layerBounds);
                  }
                }
              });
              
              talhaoLayer.addLayer(geoJSON);
            } catch (error) {
              console.error(`[SHOW] Erro ao criar camada ${index}:`, error);
            }
          });

          this.map.addLayer(talhaoLayer);
          this.weedsLayers.push(talhaoLayer);
        });

        if (globalBounds?.isValid()) {
          this.hasValidBounds = true;
          this.map.fitBounds(globalBounds, { 
            padding: [50, 50],
            maxZoom: 15
          });
        }
      } catch (error) {
        console.error('Erro ao mostrar ervas no mapa:', error);

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
      

      try {
        this.weedsLayers.forEach(layer => {
          try {
            this.map.removeLayer(layer);
          } catch (error) {
            console.error('[HIDE] Erro ao remover camada:', error);
          }
        });
        
        this.weedsLayers = [];
        this.hasValidBounds = false;
      } catch (error) {
        console.error('Erro ao esconder ervas do mapa:', error);
      }
    }
  },
  mounted() {
    // Desativa animações para evitar erros
    if (this.map) {
      this.map.options.zoomAnimation = false;
      this.map.options.fadeAnimation = false;
    }
    console.log('[MOUNT] WeedsOverlay montado com', this.weedsData.length, 'ervas');
  },
  beforeUnmount() {
    try {
      this.hideWeedsFromMap();
      this.cleanupDrawing();
      // Restaura animações
      if (this.map) {
        this.map.options.zoomAnimation = true;
        this.map.options.fadeAnimation = true;
      }
    } catch (error) {
      console.error('Erro ao desmontar componente:', error);
    }

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


.edit-weeds-btn {
  position: absolute;
  left: 246px;
  top: 154px;
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
  transition: all 0.3s ease;
}

.edit-weeds-btn.btn-closed {
  left: 10px;
}

.edit-weeds-btn.active {
  background-color: #e0f7fa;
  border: 2px solid #2196F3;
}

.edit-weeds-btn svg {
  fill: #333;
}

.edit-weeds-btn:hover:not(.disabled) {
  background: #e0f0f0;
}

.edit-weeds-btn.active:hover:not(.disabled) {
  background-color: #bbdefb;
}

.edit-weeds-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.edit-weeds-btn.disabled svg {
  fill: #999;
}

/* Estilos do modal ajustados */
.edit-modal-overlay {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 2000;
}

.edit-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 320px;
  max-width: 90%;
  overflow: hidden;
}

.modal-header {
  padding: 12px 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0 6px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 15px;
}

.tool-selection {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tool-selection button {
  flex: 1;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.tool-selection button:hover {
  background-color: #e0e0e0;
}

.tool-selection button.active {
  background-color: #e3f2fd;
  border-color: #bbdefb;
  color: #1976d2;
}

.instructions {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #2196F3;
}

.instructions p {
  margin: 0;
  color: #555;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 14px;
}

.confirm-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #3d8b40;
}

.confirm-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.clear-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.clear-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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