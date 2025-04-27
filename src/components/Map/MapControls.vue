<template>
  <div class="map-controls-container" :style="{ left: sidebarOpen ? '260px' : '40px' }">
    <div class="leaflet-control leaflet-bar">
      <!-- Botões de Zoom (agrupados com margem superior) -->
      <div class="zoom-controls-group">
        <button @click="zoomIn" class="control-btn zoom-btn" title="Zoom in">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <button @click="zoomOut" class="control-btn zoom-btn" title="Zoom out">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
      </div>
      
      <!-- Botão de Edição (redondo) -->
      <button 
        v-if="showEditButton"
        @click="toggleEditMode"
        class="control-btn edit-btn"
        :class="{ active: isEditing }"
        title="Editar polígono"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </button>
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

  methods: {
    zoomIn() {
      this.map?.zoomIn();
    },

    zoomOut() {
      this.map?.zoomOut();
    },

    toggleEditMode() {
      this.isEditing = !this.isEditing;
      this.$emit('toggle-edit', this.isEditing);
    }
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

.zoom-controls-group {
  margin-top: 40px; /* Espaço acima dos botões de zoom */
}

.control-btn {
  width: 32px;
  height: 32px;
  margin-bottom: 5px;
  background: #f4fcfc; /* Cor de fundo modificada */
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2);
}

.control-btn:hover {
  background: #e0f0f0; /* Tom de hover mais suave */
}

.control-btn svg {
  fill: #333;
}

/* Botão de edição redondo */
.edit-btn {
  border-radius: 50% !important; /* Forma redonda */
  margin-top: 10px; /* Espaço entre os zoom e o botão de edição */
  background: #f4fcfc; /* Cor de fundo modificada */
  border: 1px solid #ddd; /* Borda do botão de edição */
}

.edit-btn.active {
  background: #ff7800;
  border-color: #ff7800;
}

.edit-btn.active svg {
  fill: white;
}

/* Botões de zoom redondos */
.zoom-btn {
  border-radius: 50%; /* Forma redonda */
}

/* Ajuste da posição para a direita */
.map-controls-container {
  left: 40px; /* Desloca os controles para a direita */
}
</style>
