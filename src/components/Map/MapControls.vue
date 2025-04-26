<template>
    <div class="map-controls-container">
      <div class="leaflet-control leaflet-bar">
        <button @click="toggleSidebar" class="control-btn" title="Alternar menu">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        <button @click="zoomIn" class="control-btn" title="Zoom in">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
        <button @click="zoomOut" class="control-btn" title="Zoom out">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13H5v-2h14v2z"/>
          </svg>
        </button>
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
  
      toggleSidebar() {
        // Evento será tratado pelo componente pai
      },
  
      toggleEditMode() {
        this.isEditing = !this.isEditing;
        this.$emit('toggle-edit', this.isEditing);
      }
    }
  });
  </script>
  
  <style scoped>
  .map-controls-container {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
  }
  
  .leaflet-control {
    margin: 0 !important;
    border: none !important;
    background: none !important;
    box-shadow: none !important;
  }
  
  .control-btn {
    width: 30px;
    height: 30px;
    margin-bottom: 5px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .control-btn:hover {
    background: #f5f5f5;
  }
  
  .control-btn svg {
    fill: #333;
  }
  
  .edit-btn.active {
    background: #ff7800;
    border-color: #ff7800;
  }
  
  .edit-btn.active svg {
    fill: white;
  }
  </style>