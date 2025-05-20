<template>
  <div v-if="visible" class="status-actions-modal">
    <div class="status-actions-container">
      <div class="talhao-info" v-if="talhao">
        <h4>{{ talhao.nome || `Talhão ${talhao.mnTl}` }}</h4>
        <div class="status-control">
          <label>Status:</label>
          <select v-model="selectedStatus" @change="updateStatus">
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
          <span class="status-indicator" :style="{ backgroundColor: getStatusColor(selectedStatus) }"></span>
        </div>
      </div>
      <button class="close-button" @click="closeModal">×</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import type { Talhao } from '@/types/farms';

export default defineComponent({
  name: 'StatusActions',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    talhao: {
      type: Object as PropType<Talhao>,
      required: true
    }
  },
  setup(props, { emit }) {
    const statusOptions = [
      { value: 'EM_ABERTO', label: 'Em Aberto' },
      { value: 'APROVADO', label: 'Aprovado' },
      { value: 'RECUSADO', label: 'Recusado' },
      { value: 'EM_ANALISE', label: 'Em Análise' }
    ];

    const selectedStatus = ref(props.talhao?.status || 'EM_ABERTO');

    watch(() => props.talhao, (newTalhao) => {
      if (newTalhao) {
        selectedStatus.value = newTalhao.status || 'EM_ABERTO';
      }
    });

    const getStatusColor = (status: string) => {
      const statusColors: Record<string, string> = {
        'EM_ABERTO': '#95a5a6',
        'APROVADO': '#2ecc71',
        'RECUSADO': '#e74c3c',
        'EM_ANALISE': '#f39c12'
      };
      return statusColors[status] || '#95a5a6';
    };

    const updateStatus = () => {
      emit('status-update', selectedStatus.value);
    };

    const closeModal = () => {
      emit('update:visible', false);
    };

    return {
      statusOptions,
      selectedStatus,
      getStatusColor,
      updateStatus,
      closeModal
    };
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
  padding: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  width: 300px;
}

.status-actions-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.talhao-info {
  margin-bottom: 10px;
}

.talhao-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.status-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-control label {
  font-size: 14px;
  color: #555;
}

.status-control select {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 5px;
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