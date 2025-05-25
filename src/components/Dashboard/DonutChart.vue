<template>
  <v-card class="donut-card">
  <div class="select-wrapper">
    <v-select
      v-model="selectedFarmId"
      :items="farmOptions"
      item-title="nome"
      item-value="id"
      variant="outlined"
      density="compact"
      hide-details
      label="Selecione a Fazenda"
      @change="updateChartData"
      class="select-farm"
    />
  </div>

    <div class="chart-container">
      <Doughnut v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartOptions,
} from 'chart.js';
import api from '@/utils/api'; // Importar a instância configurada do axios

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default defineComponent({
  name: 'DonutChart',
  components: { Doughnut },
  props: {
    farms: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const selectedFarmId = ref('');
    const chartData = ref(null);

    const chartOptions: ChartOptions<'doughnut'> = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Status dos Talhões',
          color: '#023047',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      }
    };

    const farmOptions = computed(() =>
      props.farms.map((farm: any) => ({
        id: farm.id,
        nome: farm.nome
      }))
    );

    const statusColors: Record<string, string> = {
      'APROVADO': '#2ecc71',
      'RECUSADO': '#e74c3c',
      'EM_ANALISE': '#f39c12',
      'EM_ABERTO': '#95a5a6'
    };

    async function updateChartData() {
      let farm = props.farms.find((f: any) => f.id === selectedFarmId.value);

      try {
        const response = await api.get(`/areas/${selectedFarmId.value}`);
        const data = response.data;
        
        farm = {
          id: data.id,
          nome: data.nome,
          estado: data.estado,
          cidade: data.cidade,
          talhoes: data.talhoes || [],
          status: data.status || 'EM_ANALISE',
        }
      } catch (error) {
        console.error(error);
      } 

      if (!farm || !farm.talhoes) {
        chartData.value = null;
        return;
      }

      const counts: Record<string, number> = {
        APROVADO: 0,
        RECUSADO: 0,
        EM_ANALISE: 0,
        EM_ABERTO: 0
      };

      for (const talhao of farm.talhoes) {
        counts[talhao.status] = (counts[talhao.status] || 0) + 1;
      }

      chartData.value = {
        labels: ['Aprovado', 'Recusado', 'Em Análise', 'Em Aberto'],
        datasets: [
          {
            data: [
              counts.APROVADO,
              counts.RECUSADO,
              counts.EM_ANALISE,
              counts.EM_ABERTO
            ],
            backgroundColor: [
              statusColors.APROVADO,
              statusColors.RECUSADO,
              statusColors.EM_ANALISE,
              statusColors.EM_ABERTO
            ]
          }
        ]
      };
    }

    // Atualiza o gráfico se a lista de fazendas mudar
    watch(() => props.farms, () => {
      if (!selectedFarmId.value && props.farms.length > 0) {
        selectedFarmId.value = props.farms[0].id;
        updateChartData();
      }
    }, { immediate: true });

    watch(selectedFarmId, () => {
      updateChartData();
    });

    return {
      selectedFarmId,
      chartData,
      chartOptions,
      farmOptions,
      updateChartData
    };
  }
});
</script>

<style scoped>
.donut-card {
    position: absolute;
    max-width: 100%;
    width: 100%;
    height: 64vh;
    min-height: 388px;
    max-height: 600px;
    background: #F1FAFC;
    overflow-y: hidden;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    position: relative;
    margin-left: 40px;
    margin-top: 2vh;
    justify-content: center;
    align-items: center;
    padding: 3vh 3vh 3vh 3vh ;
}

.select-wrapper {
  padding: 1.5vh 0 0 0;
}

.select-farm {
  left: 1vw;
  width: 40%;
  min-width: 180px;
  font-size: 0.8rem;
  z-index: 5;
}

.chart-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>