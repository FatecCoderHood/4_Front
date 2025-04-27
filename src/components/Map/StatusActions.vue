<template>
    <div v-if="visible" class="status-actions-modal">
      <div class="status-actions-container">
        <button class="status-button rejected" @click="rejectStatus">RECUSADO</button>
        <button class="status-button approved" @click="approveStatus">APROVADO</button>
        <button class="close-button" @click="closeModal">×</button> <!-- Botão de fechamento -->
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  
  export default defineComponent({
    name: 'StatusActions',
    props: {
      visible: {
        type: Boolean,
        required: true
      },
      farmId: {
        type: Number,
        required: true
      }
    },
    methods: {
      rejectStatus() {
        this.$emit('reject', this.farmId);
      },
      approveStatus() {
        this.$emit('approve', this.farmId);
      },
      closeModal() {
        this.$emit('update:visible', false); // Atualiza a visibilidade para false, fechando o modal
      }
    }
  });
  </script>
  
  <style scoped>
  .status-actions-modal {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: white;
    border-radius: 8px;
    padding: 10px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    width: 250px; /* Ajuste o tamanho do modal */
  }
  
  .status-actions-container {
    display: flex;
    gap: 15px; /* Deixa os botões com espaçamento de 15px */
    align-items: center;
  }
  
  .status-button {
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .status-button.rejected {
    background-color: #e74c3c;
    color: white;
  }
  
  .status-button.rejected:hover {
    background-color: #c0392b;
  }
  
  .status-button.approved {
    background-color: #2ecc71;
    color: white;
  }
  
  .status-button.approved:hover {
    background-color: #27ae60;
  }
  
  .close-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    font-size: 20px;
    color: #333;
    cursor: pointer;
  }
  
  .close-button:hover {
    color: #e74c3c;
  }
  </style>
  