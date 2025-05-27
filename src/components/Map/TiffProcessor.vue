<template>
  <div class="tiff-control">
    <button
      class="map-button"
      :class="{ 'active': isTiffActive }"
      @click="toggleTiff"
    >
      <i class="icon-tiff"></i>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, PropType } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import parseGeoraster from "georaster";
import GeoRasterLayer from 'georaster-layer-for-leaflet';

const props = defineProps({
  map: {
    type: Object as PropType<L.Map | null>,
    required: true
  },
  areaId: {
    type: Number,
    required: true
  }
});

const tiffLayer = ref<GeoRasterLayer | null>(null);
const error = ref<string | null>(null);
const logs = ref<string[]>([]);
const isTiffActive = ref(false);
const tiffCache = new Map<number, GeoRasterLayer>();

function log(message: string) {
  const timestamp = new Date().toISOString().slice(11, 19);
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logs.value.push(logMessage);
  if (logs.value.length > 20) logs.value.shift();
}

function removeTiffLayer() {
  if (tiffLayer.value && props.map) {
    props.map.removeLayer(tiffLayer.value);
    log(`Layer TIFF removida do mapa para areaId ${props.areaId}`);
    tiffLayer.value = null;
  }
}

async function fetchTiffUrl(areaId: number): Promise<string | null> {
  log(`Buscando URL TIFF para areaId ${areaId}...`);
  try {
    const apiUrl = `http://localhost:8080/api/tiffs/area/${areaId}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Erro ao buscar URL TIFF: ${response.statusText}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0].url) {
      return data[0].url;
    } else {
      log('URL TIFF não encontrada na resposta.');
      return null;
    }
  } catch (err) {
    log(`Erro ao buscar URL TIFF: ${(err as Error).message}`);
    return null;
  }
}

async function createGeoRasterLayer(url: string): Promise<GeoRasterLayer> {
  log('Iniciando download e processamento do GeoTIFF...');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ao baixar TIFF: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const georaster = await parseGeoraster(arrayBuffer);
    log('GeoRaster criado com sucesso');

    const isMultiBand = georaster.numberOfRasters >= 3;

    const pixelValuesToColorFn = isMultiBand
      ? (values: number[]) => {
          if (!values) return null;
          const isNoData = values.some(
            (val, idx) => val === georaster.noDataValue || val === -9999
          );
          if (isNoData) return null;

          const normalize = (val: number, bandIndex: number) => {
            const min = georaster.mins[bandIndex];
            const max = georaster.maxs[bandIndex];
            return Math.round(((val - min) / (max - min)) * 255);
          };

          const r = normalize(values[0], 0);
          const g = normalize(values[1], 1);
          const b = normalize(values[2], 2);

          return `rgb(${r},${g},${b})`;
        }
      : (values: number[]) => {
          const val = values[0];
          if (
            val === undefined ||
            val === null ||
            val === georaster.noDataValue ||
            val === -9999
          )
            return null;

          const gray = Math.round((val / georaster.maxs[0]) * 255);
          return `rgb(${gray},${gray},${gray})`;
        };

    const layer = new GeoRasterLayer({
      georaster,
      opacity: 1,
      resolution: 216,
      pixelValuesToColorFn,
      updateWhenZooming: false,
      tileSize: 256,
      chunkedLoading: true,
      keepBuffer: 5,
      zIndex: 1000
    });

    layer.on('load', () => {
      log('TIFF renderizado no mapa com sucesso!');
      if (props.map) {
        props.map.invalidateSize();
        layer.bringToFront();
      }
    });

    return layer;
  } catch (err) {
    log(`Erro no processamento do TIFF: ${(err as Error).message}`);
    throw err;
  }
}

async function activateTiffLayer(areaId: number) {
  if (!props.map) {
    log('Mapa não disponível');
    return;
  }

  if (tiffCache.has(areaId)) {
    log(`Usando TIFF em cache para areaId ${areaId}`);
    const cachedLayer = tiffCache.get(areaId)!;
    cachedLayer.addTo(props.map);
    tiffLayer.value = cachedLayer;
    fitLayerToMap(cachedLayer);
    return;
  }

  const url = await fetchTiffUrl(areaId);
  if (!url) {
    error.value = 'URL TIFF não encontrada ou erro ao buscar.';
    return;
  }

  try {
    const layer = await createGeoRasterLayer(url);
    layer.addTo(props.map);
    tiffLayer.value = layer;
    tiffCache.set(areaId, layer);
    fitLayerToMap(layer);
  } catch (err) {
    error.value = (err as Error).message || 'Erro desconhecido ao processar TIFF.';
  }
}

function fitLayerToMap(layer: GeoRasterLayer) {
  if (props.map && layer.getBounds() && layer.getBounds().isValid()) {
    props.map.fitBounds(layer.getBounds());
  } else if (props.map) {
    props.map.setView([-15, -55], 5);
  }
}

async function toggleTiff() {
  if (isTiffActive.value) {
    removeTiffLayer();
    isTiffActive.value = false;
  } else {
    await activateTiffLayer(props.areaId);
    isTiffActive.value = true;
  }
}

watch(() => props.areaId, async (newAreaId, oldAreaId) => {
  if (!props.map) return;

  log(`AreaId mudou de ${oldAreaId} para ${newAreaId}`);
  if (tiffLayer.value) {
    removeTiffLayer();
  }

  if (isTiffActive.value) {
    await activateTiffLayer(newAreaId);
  }
});
</script>

<style scoped>
.map-button {
  position: absolute;
  top: 10px;
  right: 55px;
  width: 40px;
  height: 40px;
  z-index: 1500;
  border-radius: 50%;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.map-button:hover {
  background-color: #e9ecef;
}

.map-button.active {
  background-color: #4CAF50;
  color: white;
}

.map-button i {
  font-size: 18px;
}

.icon-tiff {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM8 16h8v2H8v-2zm0-4h8v2H8v-2z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.log-container {
  position: absolute;
  bottom: 10px;
  left: 10px;
  max-height: 150px;
  width: 300px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
}

.error-message {
  position: absolute;
  bottom: 170px;
  left: 10px;
  color: red;
  font-size: 13px;
  z-index: 1000;
}
</style>
