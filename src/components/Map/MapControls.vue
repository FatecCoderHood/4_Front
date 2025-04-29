<template>
  <div class="map-controls-container" :style="{ left: sidebarOpen ? '260px' : '40px' }">
    <div class="leaflet-control leaflet-bar">
      <!-- Container vazio após remoção dos botões -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import L from 'leaflet';

export default defineComponent({
  name: 'MapControls',
  props: {
    map: {
      type: Object as PropType<L.Map | null>,
      required: true
    },
    showEditButton: {
      type: Boolean,
      default: false
    },
    sidebarOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-edit'],

  data() {
    return {
      isEditing: false
    };
  },

  mounted() {
    const zoomControl = document.querySelector('.leaflet-control-zoom');
    if (zoomControl) {
      zoomControl.remove();
    }
  }
});
</script>

<style scoped>
.map-controls-container {
  position: absolute;
  top: 10px;
  transition: left 0.3s ease;
  z-index: 1000;
}

.leaflet-control {
  margin: 0 !important;
  border: none !important;
  background: none !important;
  box-shadow: none !important;
}

/* Ajuste da posição para a direita */
.map-controls-container {
  left: 40px;
}
</style>