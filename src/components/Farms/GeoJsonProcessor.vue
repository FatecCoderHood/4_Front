<template>
    <v-file-input
      v-model="internalFile"
      label="Upload do GeoJSON"
      accept=".geojson,.json"
      outlined
      :rules="[required ? requiredRule : () => true]"
      :loading="loading"
      @change="onFileChange"
    ></v-file-input>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  
  export default defineComponent({
    props: {
      modelValue: { type: File, default: null },
      required: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'processed'],
    setup(props, { emit }) {
      const internalFile = ref<File | null>(props.modelValue);
      const loading = ref(false);
      const requiredRule = (v: any) => !!v || 'Campo obrigatório';
  
      watch(internalFile, (val) => {
        emit('update:modelValue', val);
      });
  
      function onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input?.files;
        const selectedFile = files && files.length > 0 ? files[0] : null;
        processFile(selectedFile);
      }
  
      async function processFile(file: File | null) {
        if (!file) {
          emit('processed', { plots: [], geoJson: null });
          return;
        }
  
        loading.value = true;
        try {
          const content = await readFileAsText(file);
          const parsedData = JSON.parse(content);
  
          if (parsedData?.type !== 'FeatureCollection' || !Array.isArray(parsedData.features)) {
            throw new Error('O arquivo deve ser um FeatureCollection GeoJSON válido');
          }
  
          const plots = parsedData.features.map((feature: any, index: number) => {
            const props = feature.properties || {};
            return {
              id: props.MN_TL || index,
              mnTl: props.MN_TL || 'N/A',
              areaHaTl: props.AREA_HA_TL !== undefined ? props.AREA_HA_TL : null, 
              nome: props.FAZENDA || 'Sem nome',
              cultura: props.CULTURA || 'Desconhecido',
              solo: props.SOLO || 'Não informado',
              safra: props.SAFRA || 'Não informado',
              coordinates: feature.geometry.coordinates
            };
          });
  
          emit('processed', { plots, geoJson: parsedData });
        } catch (error) {
          console.error('Erro no processamento do GeoJSON:', error);
          emit('processed', { plots: [], geoJson: null });
        } finally {
          loading.value = false;
        }
      }
  
      function readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(new Error('Erro ao ler arquivo'));
          reader.readAsText(file);
        });
      }
  
      return {
        internalFile,
        loading,
        requiredRule,
        onFileChange
      };
    }
  });
  </script>