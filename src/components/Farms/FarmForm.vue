<template>
    <v-dialog v-model="open" max-width="1200" height="500" persistent>
      <v-card style="border-radius: 16px;">
        <v-card-title style="position: absolute;">
        </v-card-title>
  
        <v-stepper style="background-color: #FFFFFF;" v-model="currentStep">
          <v-stepper-header class="stepper-header">
            <div class="step-content">
              <div class="step-shape start-shape"
              :class="{ 'active-step': currentStep === 1, 'completed-step': currentStep === 3 || currentStep === 2}">
              <v-stepper-item :value="1" :complete="currentStep > 1" title="Sobre a Fazenda"/>
              </div>
              <div class="step-shape middle-shape"
              :class="{ 'active-step': currentStep === 2, 'completed-step': currentStep === 1 || currentStep === 3}"> 
              <v-stepper-item :value="2" :complete="currentStep > 2" title="Sobre os Talhões"/>
              </div> 
              <div class="step-shape end-shape"
              :class="{ 'active-step': currentStep === 3, 'completed-step': currentStep === 1 || currentStep === 2}">
              <v-stepper-item :value="3" title="Confirmar Dados"/>
              </div> 
            </div>
          </v-stepper-header>

          <v-stepper-window style="height: 100vh; overflow: hidden;">
            <!-- Step 1: Basic Data -->
            <v-stepper-window-item :value="1">
              <v-form ref="step1Form">
                <div style=" padding: 16px 0;">
                  <div class="form">
                    <v-row> 
                      <v-col>
                        <GeoJsonProcessor 
                          v-model="geoJsonFile" 
                          label="GeoJSON dos Talhões (Obrigatório)"
                          :required="!editing"
                          @processed="onGeoJsonProcessed"
                        />
                        <GeoJsonProcessor 
                          v-model="weedsGeoJsonFile" 
                          label="GeoJSON de Daninhas (Opcional)"
                          :required="false"
                          @processed="onWeedsGeoJsonProcessed"
                        />

                      </v-col>
                      
                      <div class=vertical-divider>
                      </div>

                      <v-col>
                        <h3 class="form-title">Insira os dados da fazenda</h3>
                          <v-text-field
                            v-model="farm.nome"
                            label="Nome da Fazenda"
                            :rules="[requiredRule]"
                            hide-details
                            class="custom-textfield"
                          ></v-text-field>
                          <v-select
                            v-model="estadoSelecionado"
                            :items="estado"
                            label="Estado"
                            item-title="text"
                            item-value="value"                            
                            :rules="[requiredRule]"
                            hide-details
                            class="custom-textfield"
                          ></v-select>
                          <v-autocomplete
                            v-model="cidadeSelecionada"
                            :items="cidade"
                            item-title="text"
                            item-value="value"                            
                            label="Cidade"
                            :rules="[requiredRule]"
                            hide-details
                            class="custom-textfield"
                            :disabled="!estadoSelecionado"
                            clearable                          
                          ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </v-form>
            </v-stepper-window-item>
  
            <!-- Step 2: Plots -->
            <v-stepper-window-item :value="2" style="overflow-y: auto;">
              <div v-if="loadingPlots" class="text-center py-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
  
              <v-data-table
                v-else
                :headers="plotHeaders"
                :items="plotsWithProductivity"
                class="elevation-1 mb-4"
              >
                <template v-slot:item.mnTl="{ item }">
                  {{ item.mnTl || 'N/A' }}
                </template>
                <template v-slot:item.areaHaTl="{ item }">
                  {{ item.areaHaTl !== null ? item.areaHaTl + ' ha' : 'N/A' }}
                </template>
                <template v-slot:item.productivity="{ item }">
                  <v-text-field
                    v-model="item.productivity"
                    type="number"
                    suffix="sacas/ano"
                    dense
                    outlined
                    hide-details
                    @change="updateProductivity(item)"
                  ></v-text-field>
                </template>
              </v-data-table>
            </v-stepper-window-item>
  
            <!-- Step 3: Confirmation -->
            <v-stepper-window-item :value="3">
              <FarmSummary 
                :farm="farm"
                :items="plotsWithProductivity"
                :weedsGeoJsonFile="weedsGeoJsonFile"
                :viewPlotHeaders="viewPlotHeaders"
                @update-productivity="updateProductivity"
              />
            </v-stepper-window-item>
          </v-stepper-window>
            <StepperFooter
              :currentStep="currentStep"
              :saving="saving"
              @close="close"
              @back="currentStep--"
              @next="handleNext"
              @save="save"
            />          
        </v-stepper>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch, computed, onMounted } from 'vue';
  import axios from 'axios';
  import { Farm, Talhao } from './types/farms';
  import GeoJsonProcessor from './GeoJsonProcessor.vue';
  import StepperFooter from './StepperFooter.vue';
  import FarmViewDialog from './FarmViewDialog.vue';
  import FarmSummary from './FarmSummary.vue';
  
  export default defineComponent({
    components: { GeoJsonProcessor, StepperFooter, FarmSummary, FarmViewDialog },
    props: {
      open: { type: Boolean, required: true },
      editing: { type: Boolean, default: false },
      farmData: { type: Object as () => Farm, default: null },
      loading: { type: Boolean, default: false }
    },
    emits: ['close', 'save'],
    setup(props, { emit }) {
      const estado = ref([]);
      const cidade = ref([]);

      const estadoSelecionado = ref(null);
      const cidadeSelecionada = ref(null);
  
      const currentStep = ref(1);
      const step1Form = ref<any>(null);
      const requiredRule = (v: any) => !!v || 'Campo obrigatório';
      const geoJsonFile = ref<File | null>(null);
      const weedsGeoJsonFile = ref<File | null>(null);
      const plots = ref<Talhao[]>([]);
      const loadingPlots = ref(false);
      const geoJsonData = ref<any>(null);
      const weedsGeoJsonData = ref<any>(null);
      const saving = ref(false);
      const productivityMap = ref<Record<string, number>>({});
  
      const farm = ref<Farm>({
        nome: '',
        cidade: '',
        estado: ''
      });

      const viewPlotHeaders = [
        { title: 'TALHÃO',text: 'Talhão', value: 'nome' },
        { title: 'ÁREA (ha)', value: 'areaHaTl' },
        { title: 'SOLO', value: 'solo' },
        { title: 'CULTURA', value: 'cultura' },
        { title: 'SAFRA', value: 'safra' },
        { title: 'PRODUTIVIDADE (sacas/ano)', value: 'productivity' }
      ];
  
      const plotHeaders = [
        { title: 'MN_TL', value: 'mnTl' },
        { title: 'ÁREA (ha)', value: 'areaHaTl' },
        { title: 'SOLO', value: 'solo' },
        { title: 'CULTURA', value: 'cultura' },
        { title: 'SAFRA', value: 'safra' },
        { title: 'PRODUTIVIDADE (sacas/ano)', value: 'productivity' }
      ];
  
      const plotsWithProductivity = computed(() => {
        return plots.value.map(plot => ({
          ...plot,
          productivity: productivityMap.value[plot.mnTl] || 0
        }));
      });
  
      watch(() => props.open, (val) => {
        if (val && props.farmData) {
          farm.value = { ...props.farmData };
          // Se estiver editando, carregue os dados existentes de produtividade
          if (props.farmData.productivity) {
            productivityMap.value = { ...props.farmData.productivity };
          }
        } else if (!val) {
          resetForm();
        }
      });

      watch(estadoSelecionado, async (novoEstado) => {
        cidadeSelecionada.value = null;
        farm.value.estado = novoEstado;
        if (novoEstado) {
          const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${novoEstado}/municipios`);
          cidade.value = response.data.map((c) => ({ text: c.nome, value: c.nome,}));
        } else {
          cidade.value = [];
        }
      });

      watch(cidadeSelecionada, (novaCidade) => {
        farm.value.cidade = novaCidade;
      });

      onMounted(async () => {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        estado.value = response.data
          .map((e) => ({text: e.nome, value: e.sigla,}))
          .sort((a, b) => a.text.localeCompare(b.text));
      });
  
      function resetForm() {
        farm.value = { nome: '', cidade: '', estado: '' };
        geoJsonFile.value = null;
        weedsGeoJsonFile.value = null;
        plots.value = [];
        geoJsonData.value = null;
        weedsGeoJsonData.value = null;
        productivityMap.value = {};
        currentStep.value = 1;
      }
  
      function close() {
        emit('close');
      }
  
      function onGeoJsonProcessed(data: { plots: Talhao[], geoJson: any }) {
        loadingPlots.value = true;
        try {
          plots.value = data.plots;
          geoJsonData.value = data.geoJson;
          
          // Inicializa o mapa de produtividade para os novos talhões
          data.plots.forEach(plot => {
            if (!productivityMap.value[plot.mnTl]) {
              productivityMap.value[plot.mnTl] = 0;
            }
          });
          
          if (!props.editing && data.plots.length > 0) {
            farm.value.nome = data.plots[0].nome || farm.value.nome;
          }
        } finally {
          loadingPlots.value = false;
        }
      }
  
      function onWeedsGeoJsonProcessed(data: { geoJson: any }) {
        weedsGeoJsonData.value = data.geoJson;
      }
  
      function updateProductivity(item: any) {
        productivityMap.value[item.mnTl] = Number(item.productivity);
      }
    
      async function handleNext() {
        if (currentStep.value === 1) {
          if (step1Form.value) {
            const { valid } = await step1Form.value.validate();
            if (valid) {
              currentStep.value++;
            }
          }
        } else {
          // Para steps 2 e 3, sem validação
          currentStep.value++;
        }
      }
  
        function save() {
        saving.value = true;
        const payload = {
          nome: farm.value.nome,
          estado: estadoSelecionado.value,
          cidade: cidadeSelecionada.value,
          geojson: geoJsonData.value,
          ervasDaninhasGeojson: weedsGeoJsonData.value, // Nome corrigido
          produtividadePorAno: productivityMap.value, // Nome corrigido
        };
        emit('save', payload);
        setTimeout(() => {
          saving.value = false;
        }, 2000);
      }
  
      return {
        estado,
        cidade,
        estadoSelecionado,
        cidadeSelecionada,
        currentStep,
        step1Form,
        requiredRule,
        geoJsonFile,
        weedsGeoJsonFile,
        plots,
        plotsWithProductivity,
        loadingPlots,
        plotHeaders,
        viewPlotHeaders,
        farm,
        StepperFooter,
        close,
        onGeoJsonProcessed,
        onWeedsGeoJsonProcessed,
        updateProductivity,
        handleNext,
        save,
        saving
      };
    }
  });
  </script>

<style scoped>

.v-dialog {
  max-height: 100vh;
  overflow-y: auto;
}

/* header */
.stepper-header {
  padding: 4px;
  max-height: 90px;
  min-height: 80px;
  justify-content: center;
  background-color: #F1FAFC;
}
.step-shape {
  display: flex;
  color: white;
  background-color: #023047;
  margin-top: 12px;
  width: 270px;
  height: 45px;
  align-items: center;
  justify-content: center;
}
.step-shape.active-step {
  background-color: #023047;
  color: white;
}
.step-shape.completed-step {
  background-color: #D9D9D9;
  color: #023047;
}

.start-shape {
  clip-path: polygon(5% 0, 90% 0, 100% 50%, 90% 100%, 5% 100%);
}
.middle-shape {
  clip-path: polygon(90% 0%, 1% 0%, 10% 50%, 1% 100%, 90% 100%, 100% 50%);
}
.end-shape {
  clip-path: polygon(90% 0%, 1% 0%, 10% 50%, 1% 100%, 90% 100%);
  }
.step-content {
  display: flex;
  gap: 40px;
}

/* step1 */


.form {
  flex: 1;
}
.custom-textfield {
  max-width: 340px;
  width: 100%;
  font-size: 14px;
  margin-bottom: 16px;
}
.form-title {
  color: #023047;
  font-size: 24px;
  margin-bottom: 8px;
}
.vertical-divider {
  display: flex;
  align-self: stretch;  
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 80px;
}
.vertical-divider::before{
  content: '';
  position: absolute;
  height: 100%;
  width: 1px;
  background-color: #A0A0A0;
  left: 50%;
  transform: translateX(-50%);
}
.vertical-divider span {
  background: white;
  z-index: 1;
  color: #023047;
}

</style>