<template>
    <div class="drawing-control-panel">
      <h4>Editando: {{ area.nome }}</h4>
      <button @click="$emit('save')" class="save-btn">Salvar Polígono</button>
      <button @click="$emit('cancel')" class="cancel-btn">Cancelar</button>
      <p class="hint">Arraste os pontos para editar o polígono</p>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { Farm } from '@/types/farms';
  
  export default defineComponent({
    name: 'DrawingPanel',
    props: {
      area: {
        type: Object as PropType<Farm>,
        required: true
      }
    },
    emits: ['save', 'cancel']
  });
  </script>
  
  <style scoped>
  .drawing-control-panel {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.95);
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    text-align: center;
  }
  
  .drawing-control-panel h4 {
    margin: 0 0 10px 0;
    color: #333;
  }
  
  .drawing-control-panel button {
    padding: 8px 15px;
    margin: 0 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .save-btn {
    background-color: #4CAF50;
    color: white;
  }
  
  .cancel-btn {
    background-color: #f44336;
    color: white;
  }
  
  .hint {
    margin: 10px 0 0 0;
    font-size: 0.9em;
    color: #666;
  }
  </style>