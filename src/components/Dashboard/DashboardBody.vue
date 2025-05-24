<template>
    <v-container style="background-color: #D9D9D9; border-radius: 8px; height: 100vh; max-height: max-content;">
        <v-row>
            <v-col cols="12" md="6" lg="4" class="me-16">
                <v-list class = "ranking-list">
                    <div class="ranking-header">
                        <div class="rank-title">Ranking Analista</div>
                    </div>
                    <div class="list-header">
                      <div class="list-cell text1-ajust">Nome</div>
                      <div class="list-cell">Horas Analisadas</div>
                      <div class="list-cell">Quantidade (Talhões)</div>
                    </div>
                    <v-list-item v-for="(analysts, index) in usersComNumeracao" :key="index" class="v-list-item">
                      <div class="list-cell"> {{ analysts.numeroNomeAnalyst }} {{ analysts.nome }}</div>
                      <div class="list-cell"></div>
                      <div class="list-cell"></div>
                    </v-list-item>
                </v-list>
            </v-col>

            <v-col cols="8" md="4" lg="2" class="me-16">
              <v-card class= "kpi-card">
                <div class="kpi-header">Talhões Aprovados (%)</div>
              </v-card>
              <v-card class= "kpi-card">
                <div class="kpi-header"></div>
              </v-card>
              <v-card class= "kpi-card">
                <div class="kpi-header">Quantidade Analistas</div>
              </v-card>                 
            </v-col>
            
            <v-col cols="12" md="6" lg="4">
              <DonutChart :farms="farms" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DonutChart from '@/components/Dashboard/DonutChart.vue';

export default defineComponent({
  name: 'DashboardBody',
  components: {
    DonutChart
  },
  props: {
    users: {
      type: Array,
      required: true
    },
    farms: {
      type: Array,
      required: true
    }
  },
computed: {
  usersComNumeracao() {
    return this.users.map((user, i) => ({
      ...user,
      numeroNomeAnalyst: i + 1
    }));
  }
}
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

.v-list-item {
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  padding-right: 0;
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

</style>