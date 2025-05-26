<template>
    <v-dialog v-model="uploadOpen" max-width="500px">
      <v-card style="background-color: #F1FAFC;">
        <v-card-title class="text-black" style="font-weight: 600;">
          <h3> Carregar arquivo TIFF e vincular à fazenda: </h3>
        </v-card-title>
        <v-card-text class="bg-white">
          <v-container>
            <v-row cols="12" sm="6" md="6">
                  <v-file-input
                      v-model="tiffFile"
                      label="Upload da Imagem Tiff"
                      accept=".tiff,.tif,image/tiff"
                      outlined
                      :required="false"
                  />                    
            </v-row>
            <v-row>
                  <v-select
                      v-model="selectedFarmId"
                      :items="farms"
                      item-title="nome"
                      item-value="id"
                      label="Selecione a fazenda"
                      outlined
                      dense
                  />
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="bg-white">
          <v-spacer></v-spacer>
          <v-btn color="error" 
          variant="text" 
          @click='onClose'
          class="text-black">
            Cancelar
          </v-btn>
          <v-btn 
          color="primary" 
          variant="text" 
          @click='onSubmit'
          class="text-black"
          :disabled="!selectedFarmId || !tiffFile">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>    
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  props: {
      farms: { type: Array, required: true },
      uploadOpen: { type: Boolean, required: true }
  },
  emits: ['update:uploadOpen', 'submitUpload', 'upload-success'],
  setup(props, { emit }) {
      const selectedFarmId = ref<string | null>(null);
      const tiffFile = ref<File | null>(null);
      const isLoading = ref(false);
      const errorMessage = ref<string | null>(null);

      const uploadTiff = async (file: File, farmId: string) => {
          isLoading.value = true;
          errorMessage.value = null;
          
          try {
              console.log('[FRONTEND] Preparando upload...');
              const formData = new FormData();
              formData.append('file', file);
              formData.append('areaId', farmId);
              
              const response = await axios.post('http://localhost:8080/api/tiffs', formData, {
                  headers: {
                      'Content-Type': 'multipart/form-data'
                  },
                  timeout: 120000
              });
              
              console.log('[FRONTEND] Upload concluído com sucesso:', response.data);
              return response.data;
          } catch (error: any) {
              console.error('[FRONTEND] Erro no upload:', error);
              if (error.response) {
                  errorMessage.value = error.response.data?.message || 'Erro durante o upload';
              } else {
                  errorMessage.value = 'Erro de conexão com o servidor';
              }
              throw error;
          } finally {
              isLoading.value = false;
          }
      };

      const onSubmit = async () => {
          console.log('[FRONTEND] Iniciando submit do upload...');
          console.log('[FRONTEND] Farm ID selecionado:', selectedFarmId.value);
          console.log('[FRONTEND] Arquivo selecionado:', tiffFile.value);
          
          if (selectedFarmId.value && tiffFile.value) {
              console.log('[FRONTEND] Dados válidos, iniciando upload...');
              
              try {
                  await uploadTiff(tiffFile.value, selectedFarmId.value);
                  emit('upload-success');
                  
                  // Resetar formulário
                  selectedFarmId.value = null;
                  tiffFile.value = null;
                  emit('update:uploadOpen', false);
              } catch (error) {
                  console.error('[FRONTEND] Falha no upload:', error);
              }
          } else {
              errorMessage.value = 'Selecione uma fazenda e um arquivo válido.';
              console.warn('[FRONTEND] Dados inválidos para upload:', {
                  farmId: selectedFarmId.value,
                  file: tiffFile.value
              });
          }
      };

      const onClose = () => {
          selectedFarmId.value = null;
          tiffFile.value = null;
          errorMessage.value = null;
          emit('update:uploadOpen', false);
      };

      const handleFileChange = (event: Event) => {
          const input = event.target as HTMLInputElement;
          if (input.files && input.files.length > 0) {
              const file = input.files[0];
              if (file.name.endsWith('.tif') || file.name.endsWith('.tiff')) {
                  tiffFile.value = file;
                  errorMessage.value = null;
              } else {
                  errorMessage.value = 'Apenas arquivos .tif ou .tiff são permitidos';
              }
          }
      };

      return {
          selectedFarmId,
          tiffFile,
          isLoading,
          errorMessage,
          onSubmit,
          onClose,
          handleFileChange
      };
  },
});
</script>