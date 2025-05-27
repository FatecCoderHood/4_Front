<template>
  <v-container style="background-color: #D9D9D9; border-radius: 8px; height: 100vh; max-height: max-content;">
    <v-row>
      <v-col cols="12" md="6" lg="4" class="me-16">
        <v-list class="ranking-list">
          <div class="ranking-header">
            <div class="rank-title">
              Ranking Analista
            </div>
          </div>
          <div class="list-header">
            <div class="list-cell text1-ajust">
              Nome
            </div>
            <div class="list-cell">
              Horas Analisadas
            </div>
            <div class="list-cell">
              Quantidade (Talhões)
            </div>
          </div>
          <div v-for="(analyst, index) in usersComNumeracao" :key="index" class="ranking-row">
            <div class="list-cell"> 
              {{ analyst.numeroNomeAnalyst }} {{ analyst.nome }}
            </div>
            <div class="list-cell"> 
              {{ analyst.horasAnalisadas || 0 }}
            </div>
            <div class="list-cell">
              {{ analyst.quantidadeTalhoes || 0 }}
            </div>
          </div>
        </v-list>
      </v-col>

      <v-col cols="8" md="4" lg="2" class="me-16">
        <v-card class="kpi-card">
          <div class="kpi-header">Talhões Aprovados (%)</div>
          <div class="kpi-value">{{ talhoesAprovadosPercentual }}%</div>
        </v-card>
        <v-card class="kpi-card">
          <div class="kpi-header">Total de Talhões</div>
          <div class="kpi-value">{{ talhoesEstatisticas.total }}</div>
        </v-card>
        <v-card class="kpi-card">
          <div class="kpi-header">Quantidade Analistas</div>
          <div class="kpi-value">{{ quantidadeAnalistas }}</div>
        </v-card>                 
      </v-col>
            
      <v-col cols="12" md="6" lg="4">
        <DonutChart :farms="farms" @farm-changed="onFarmChanged" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import DonutChart from '@/components/Dashboard/DonutChart.vue';
import api from '@/utils/api';
import type { Farm, Talhao, User } from '@/types/farms';

// Componente como default export
export default defineComponent({
  name: 'DashboardBody',
  components: {
    DonutChart
  },
  props: {
    users: {
      type: Array as PropType<User[]>,
      required: true
    },
    farms: {
      type: Array as PropType<Farm[]>,
      required: true
    }
  },
  data() {
    return {
      selectedFarmId: null as string | null,
      selectedFarmData: null as Farm | null
    };
  },
  computed: {
    farmsForCalculation(): Farm[] {
      // Se uma fazenda específica foi selecionada, usar apenas ela
      if (this.selectedFarmId && this.selectedFarmData) {
        return [this.selectedFarmData];
      }
      // Caso contrário, usar todas as fazendas
      return this.farms;
    },
    usersComNumeracao(): User[] {
      return this.users.map((user: User, i: number) => ({
        ...user,
        numeroNomeAnalyst: i + 1,
      }));
    },
    talhoesEstatisticas() {
      const stats = {
        total: 0,
        aprovados: 0,
        recusados: 0,
        emAnalise: 0,
        emAberto: 0
      };

      this.farmsForCalculation.forEach((farm: Farm) => {
        
        if (farm.talhoes && Array.isArray(farm.talhoes)) {
          farm.talhoes.forEach((talhao: Talhao) => {
            stats.total++;
            
            switch (talhao.status) {
              case 'APROVADO':
                stats.aprovados++;
                break;
              case 'RECUSADO':
                stats.recusados++;
                break;
              case 'EM_ANALISE':
                stats.emAnalise++;
                break;
              case 'EM_ABERTO':
                stats.emAberto++;
                break;
            }
          });
        }
      });
      return stats;
    },
    talhoesAprovadosPercentual(): number {
      if (this.talhoesEstatisticas.total === 0) return 0;
      return Math.round((this.talhoesEstatisticas.aprovados / this.talhoesEstatisticas.total) * 100);
    },
    quantidadeAnalistas(): number {
      return this.users.length;
    }
  },
  methods: {
    async onFarmChanged(farmId: string | null) {
      this.selectedFarmId = farmId;
      
      if (farmId) {
        try {
          const response = await api.get(`/areas/${farmId}`);
          this.selectedFarmData = {
            ...response.data,
            talhoes: response.data.talhoes || []
          } as Farm;
        } catch {
          this.selectedFarmData = null;
        }
      } else {
        this.selectedFarmData = null;
      }
    }
  },
});
</script>

<style scoped>
/* ranking style */
.ranking-container {
  background-color: #D9D9D9;
  border-radius: 8px;
  min-height: 80vh;
  max-height: 100vh;
}

.ranking-list {
  padding: 0;
  max-width: 100%;
  width: 100%;
  height: 64vh;
  min-height: 388px;
  max-height: 600px;
  background: #F1FAFC;
  overflow-y: auto;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  margin-left: 40px;
  margin-top: 2vh;
}

/* ranking style header */
.ranking-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 8vh;
  max-height: 200px;
  min-height: 40px;
  width: 100%;
  background-color: #023047;
  display: flex;
  justify-content: center;
}

.rank-title{
  position: sticky;
  top: 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.list-header {
  display: flex;
  background-color: #023047;
  color: white;
  padding: 10px 5px;
  font-weight: 600;
  font-size: 0.70rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.ranking-row {
  display: flex;
  padding: 10px 5px;
  border-bottom: 1px solid #e0e0e0;
}

.ranking-row:hover {
  background-color: #f5f5f5;
}

.text1-ajust {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ranking list style */
.list-cell {
  flex: 1;
  text-align: center;
  padding: 0px 8px;
  font-weight: 600;
  font-size: 0.70rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* KPI cards style */
.kpi-card {
  max-width: 100%;
  width: 100%;
  height: 20vh;
  max-height: 160px;
  background: #F1FAFC;
  overflow-y: hidden;
  border-radius: 8px;
  margin-left: 40px;
  margin-top: 2vh;
}

.kpi-header {
  display: flex;
  background-color: #023047;
  color: white;
  height: 40%;
  font-weight: 600;
  font-size: 0.70rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  justify-content: center;
  align-items: center;
}

.kpi-value {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60%;
  font-weight: bold;
  font-size: 2rem;
  color: #023047;
}
</style>