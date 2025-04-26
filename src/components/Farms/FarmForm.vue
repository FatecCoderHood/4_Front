<template>
    <v-dialog v-model="open" max-width="800" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ editing ? 'Editar Fazenda' : 'Nova Fazenda' }}</span>
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
  
        <v-stepper v-model="currentStep">
          <v-stepper-header>
            <v-stepper-item :value="1" :complete="currentStep > 1" title="Dados Básicos"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :value="2" :complete="currentStep > 2" title="Talhões"></v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :value="3" title="Confirmação"></v-stepper-item>
          </v-stepper-header>
  
          <v-stepper-window>
            <!-- Step 1: Basic Data -->
            <v-stepper-window-item :value="1">
              <v-form ref="step1Form">
                <v-text-field
                  v-model="farm.nome"
                  label="Nome da Fazenda"
                  :rules="[requiredRule]"
                  outlined
                  class="mb-4"
                ></v-text-field>
  
                <v-select
                  v-model="farm.estado"
                  :items="states"
                  label="Estado"
                  :rules="[requiredRule]"
                  outlined
                  class="mb-4"
                ></v-select>
  
                <v-text-field
                  v-model="farm.cidade"
                  label="Cidade"
                  :rules="[requiredRule]"
                  outlined
                  class="mb-4"
                ></v-text-field>
  
                <GeoJsonProcessor 
                  v-model="geoJsonFile" 
                  :required="!editing"
                  @processed="onGeoJsonProcessed"
                />
              </v-form>
  
              <v-btn color="primary" @click="validateStep1">Próximo</v-btn>
            </v-stepper-window-item>
  
            <!-- Step 2: Plots -->
            <v-stepper-window-item :value="2">
              <div v-if="loadingPlots" class="text-center py-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
  
              <v-data-table
                v-else
                :headers="plotHeaders"
                :items="plots"
                class="elevation-1 mb-4"
              >
                <template v-slot:item.mnTl="{ item }">
                  {{ item.mnTl || 'N/A' }}
                </template>
                <template v-slot:item.areaHaTl="{ item }">
                  {{ item.areaHaTl !== null ? item.areaHaTl + ' ha' : 'N/A' }}
                </template>
              </v-data-table>
  
              <v-btn color="secondary" @click="currentStep--" class="mr-2">Voltar</v-btn>
              <v-btn color="primary" @click="currentStep++">Próximo</v-btn>
            </v-stepper-window-item>
  
            <!-- Step 3: Confirmation -->
            <v-stepper-window-item :value="3">
              <v-card outlined class="mb-4">
                <v-card-title>Resumo da Fazenda</v-card-title>
                <v-card-text>
                  <p><strong>Nome:</strong> {{ farm.nome }}</p>
                  <p><strong>Localização:</strong> {{ farm.cidade }}, {{ farm.estado }}</p>
                  <p><strong>Número de Talhões:</strong> {{ plots.length }}</p>
                </v-card-text>
              </v-card>
  
              <v-btn color="secondary" @click="currentStep--" class="mr-2">Voltar</v-btn>
              <v-btn color="primary" @click="save" :loading="saving">
                {{ editing ? 'Atualizar' : 'Cadastrar' }}
              </v-btn>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Farm, Talhao } from '@/types/farm';
  import GeoJsonProcessor from './GeoJsonProcessor.vue';
  
  export default defineComponent({
    components: { GeoJsonProcessor },
    props: {
      open: { type: Boolean, required: true },
      editing: { type: Boolean, default: false },
      farmData: { type: Object as () => Farm, default: null },
      loading: { type: Boolean, default: false }
    },
    emits: ['close', 'save'],
    setup(props, { emit }) {
      const states = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ];
  
      const currentStep = ref(1);
      const step1Form = ref<any>(null);
      const requiredRule = (v: any) => !!v || 'Campo obrigatório';
      const geoJsonFile = ref<File | null>(null);
      const plots = ref<Talhao[]>([]);
      const loadingPlots = ref(false);
      const geoJsonData = ref<any>(null);
      const saving = ref(false);
  
      const farm = ref<Farm>({
        nome: '',
        cidade: '',
        estado: ''
      });
  
      const plotHeaders = [
        { title: 'MN_TL', value: 'mnTl' },
        { title: 'ÁREA (ha)', value: 'areaHaTl' },
        { title: 'SOLO', value: 'solo' },
        { title: 'CULTURA', value: 'cultura' },
        { title: 'SAFRA', value: 'safra' }
      ];
  
      watch(() => props.open, (val) => {
        if (val && props.farmData) {
          farm.value = { ...props.farmData };
        } else if (!val) {
          resetForm();
        }
      });
  
      function resetForm() {
        farm.value = { nome: '', cidade: '', estado: '' };
        geoJsonFile.value = null;
        plots.value = [];
        geoJsonData.value = null;
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
          
          if (!props.editing && data.plots.length > 0) {
            farm.value.nome = data.plots[0].nome || farm.value.nome;
          }
        } finally {
          loadingPlots.value = false;
        }
      }
  
      async function validateStep1() {
        if (step1Form.value) {
          const { valid } = await step1Form.value.validate();
          if (valid) {
            currentStep.value++;
          }
        }
      }
  
      function save() {
        saving.value = true;
        const payload = {
          ...farm.value,
          geojson: geoJsonData.value
        };
        emit('save', payload);
      }
  
      return {
        states,
        currentStep,
        step1Form,
        requiredRule,
        geoJsonFile,
        plots,
        loadingPlots,
        plotHeaders,
        farm,
        close,
        onGeoJsonProcessed,
        validateStep1,
        save,
        saving
      };
    }
  });
  </script>