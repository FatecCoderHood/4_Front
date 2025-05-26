<template>
    <div class="tiff-control" ref="controlContainer">
      <button 
        @click="toggleTiffLayer"
        :class="{ 'active': tiffVisible }"
        class="tiff-button"
        ref="tiffButton"
      >
        {{ tiffVisible ? 'Ocultar TIFF' : 'Mostrar TIFF' }}
      </button>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="debug-info" v-if="debugInfo">
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import L from 'leaflet';
  import 'leaflet-geotiff';
  import 'leaflet-geotiff/leaflet-geotiff-plotty';
  import 'geotiff';
  
  export default defineComponent({
    name: 'TiffControl',
    props: {
      map: {
        type: Object as () => L.Map | null,
        required: true
      },
      areaId: {
        type: Number,
        default: null
      }
    },
  
    data() {
      return {
        tiffVisible: false,
        tiffLayer: null as L.Layer | null,
        error: null as string | null,
        debugInfo: null as string | null,
        logs: [] as string[],
        currentBounds: null as L.LatLngBounds | null
      };
    },
  
    mounted() {
      this.log('Componente montado');
      this.log(`Mapa disponível: ${!!this.map}`);
      this.log(`areaId: ${this.areaId}`);
      
      if (this.map) {
        this.currentBounds = this.map.getBounds();
        this.map.on('moveend', this.updateBounds);
      }
      
      this.updateDebugInfo();
    },
  
    watch: {
      areaId(newVal, oldVal) {
        this.log(`areaId alterado de ${oldVal} para ${newVal}`);
        if (this.tiffVisible) {
          this.loadTiff();
        }
      }
    },
  
    methods: {
      updateBounds() {
        if (this.map) {
          this.currentBounds = this.map.getBounds();
        }
      },
  
      log(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}${data ? ' - ' + JSON.stringify(data) : ''}`;
        this.logs.push(logEntry);
        console.log(logEntry);
      },
  
      async toggleTiffLayer() {
        this.log('toggleTiffLayer chamado');
        this.tiffVisible = !this.tiffVisible;
        
        if (this.tiffVisible) {
          await this.loadTiff();
        } else {
          this.removeTiffLayer();
        }
        
        this.updateDebugInfo();
      },
  
      async loadTiff() {
        this.log('Iniciando loadTiff');
        
        if (!this.map) {
          this.error = "Mapa não disponível";
          this.log('Erro: Mapa não disponível');
          this.tiffVisible = false;
          this.updateDebugInfo();
          return;
        }
  
        if (!this.areaId) {
          this.error = "ID da área não disponível";
          this.log('Erro: areaId não disponível');
          this.tiffVisible = false;
          this.updateDebugInfo();
          return;
        }
  
        try {
          this.removeTiffLayer();
          this.log(`Buscando TIFFs para área ${this.areaId}`);
  
          const apiUrl = `http://localhost:8080/api/tiffs/area/${this.areaId}`;
          this.log(`Fetching URL: ${apiUrl}`);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          this.log('Resposta da API recebida', { status: response.status });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const tiffs = await response.json();
          this.log('Resposta completa da API:', tiffs);
  
          // Correção principal: Verificamos se é um array e não está vazio
          if (!Array.isArray(tiffs)) {
            this.error = "Formato de resposta inesperado da API";
            this.log('Formato de resposta inesperado', { received: tiffs });
            this.tiffVisible = false;
            this.updateDebugInfo();
            return;
          }
  
          if (tiffs.length === 0) {
            this.error = "Nenhum TIFF encontrado para esta área";
            this.log('Nenhum TIFF encontrado para a área');
            this.tiffVisible = false;
            this.updateDebugInfo();
            return;
          }
  
          for (const tiff of tiffs) {
            this.log('Processando TIFF:', tiff);
            
            try {
              const layer = (L as any).leafletGeotiff(tiff.url, {
                band: 0,
                displayMin: 0,
                displayMax: 100,
                name: 'Imagem',
                colorScale: 'viridis',
                opacity: 0.8,
                clampLow: false,
                clampHigh: false,
                useWorker: false,
                noDataValue: -9999,
                overrideProjection: 'EPSG:4326'
              }).addTo(this.map);
              
              this.tiffLayer = layer;
              this.log('TIFF adicionado ao mapa com sucesso');
  
              layer.on('load', () => {
                try {
                  if (layer.getBounds) {
                    const bounds = layer.getBounds();
                    if (bounds && bounds.isValid()) {
                      this.map.fitBounds(bounds);
                      this.log('Mapa ajustado para os bounds do TIFF', bounds);
                    }
                  }
                } catch (e) {
                  this.log('Erro ao ajustar bounds', { error: e.message });
                }
              });
  
            } catch (err) {
              this.log('Erro ao adicionar TIFF ao mapa', { error: err.message });
              throw err;
            }
          }
  
          this.error = null;
        } catch (err) {
          this.error = "Erro ao carregar imagens TIFF";
          this.log('Erro ao carregar TIFFs', { error: err.message });
          this.tiffVisible = false;
        } finally {
          this.updateDebugInfo();
        }
      },
  
      removeTiffLayer() {
        this.log('Removendo camada TIFF');
        if (this.tiffLayer && this.map) {
          try {
            this.map.removeLayer(this.tiffLayer);
            this.tiffLayer = null;
            this.log('Camada TIFF removida com sucesso');
          } catch (err) {
            this.log('Erro ao remover camada TIFF', { error: err.message });
          }
        }
        this.updateDebugInfo();
      },
  
      updateDebugInfo() {
        this.debugInfo = [
          `Status: ${this.tiffVisible ? 'Ativo' : 'Inativo'}`,
          `Erro: ${this.error || 'Nenhum'}`,
          `Camada TIFF: ${this.tiffLayer ? 'Presente' : 'Ausente'}`,
          `Mapa: ${this.map ? 'Disponível' : 'Indisponível'}`,
          `areaId: ${this.areaId || 'Nenhum'}`,
          `Bounds Atuais: ${this.currentBounds ? this.currentBounds.toString() : 'Nenhum'}`,
          '--- Logs ---',
          ...this.logs.slice(-10)
        ].join('\n');
      }
    },
  
    beforeUnmount() {
      this.log('Componente será desmontado');
      if (this.map) {
        this.map.off('moveend', this.updateBounds);
      }
      this.removeTiffLayer();
    }
  });
  </script>
  
  <style scoped>
  .tiff-control {
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 1000;
    background: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
    max-width: 300px;
  }
  
  .tiff-button {
    padding: 8px 16px;
    background: #ffffff;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 8px;
    display: block;
    width: 100%;
  }
  
  .tiff-button:hover {
    background: #f5f5f5;
  }
  
  .tiff-button.active {
    background: #4caf50;
    color: white;
  }
  
  .error-message {
    color: #d32f2f;
    font-size: 12px;
    margin: 8px 0;
    padding: 4px;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    background-color: #ffebee;
  }
  
  .debug-info {
    font-family: monospace;
    font-size: 10px;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 8px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  /* Estilo para debug da camada TIFF */
  :deep(.leaflet-geotiff-layer) {
    border: 2px solid rgba(255, 0, 0, 0.5) !important;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.3) !important;
  }
  </style>