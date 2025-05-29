<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2>Gestão de Fazendas</h2>
      </v-col>
    </v-row>

    <FarmList
      :farms="areas"
      :loading="loading"
      @add-farm="openAddModal"
      @view-talhao="openViewModal"
      @edit-farm="openEditModal"
      @delete-farm="confirmDelete"
      @upload="openUploadModal"
    />

    <FarmForm
      v-model="modalOpen"
      :open="modalOpen"
      :editing="editing"
      :farm-data="selectedArea"
      :loading="saving"
      @close="closeModal"
      @save="saveArea"
    />

    <FarmDeleteDialog
      v-model="deleteDialogOpen"
      :open="deleteDialogOpen"
      :loading="deleting"
      @close="deleteDialogOpen = false"
      @confirm="deleteArea"
    />

    <FarmUploadTiff
      :farms="areas"
      :uploadOpen="uploadOpen"
      @update:uploadOpen="uploadOpen = $event"
      @submitUpload="uploadTiff"
    />

    <FarmViewDialog 
    v-model="viewOpen"
    :open="viewOpen"
    @close="viewOpen = false"
    />

    <v-snackbar v-model="showSnackbar" :timeout="5000" :color="snackbarColor" top right>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios, { AxiosError } from 'axios';
import FarmList from '@/components/farms/FarmList.vue';
import FarmForm from '@/components/farms/FarmForm.vue';
import FarmDeleteDialog from '@/components/farms/FarmDeleteDialog.vue';
import FarmViewDialog from '@/components/Farms/FarmViewDialog.vue';
import FarmUploadTiff from '@/components/Farms/FarmUploadTiff.vue';
import type { AxiosError } from 'axios';
import axios from 'axios';

// Configuração do axios para apontar para o backend correto
const api = axios.create({
  baseURL: 'http://localhost:8080', // Altere para a porta do seu backend Spring
  timeout: 50000,
});

interface Area {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  geojson?: any;
}

export default defineComponent({
  components: { FarmList, FarmForm, FarmDeleteDialog, FarmUploadTiff },
  setup() {
    const areas = ref<Area[]>([]);
    const loading = ref(false);
    const modalOpen = ref(false);
    const viewOpen = ref (false);
    const deleteDialogOpen = ref(false);
    const editing = ref(false);
    const saving = ref(false);
    const deleting = ref(false);
    const selectedArea = ref<Area | null>(null);
    const areaToDeleteId = ref('');
    const showSnackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');
    const uploadOpen = ref(false);
    const tiffFile = ref<File | null>(null);

    async function loadAreas() {
      loading.value = true;
      try {
        const response = await api.get('/areas');
        
        if (!Array.isArray(response.data)) {
          throw new Error('Resposta da API não é um array');
        }
        
        areas.value = response.data.map((area: any) => ({
          id: area.id,
          nome: area.nome || 'Sem nome',
          cidade: area.cidade || '',
          estado: area.estado || '',
          geojson: area.geojson
        }));
      } catch (error) {
        console.error('Erro ao carregar áreas:', error);
        showFeedback('Erro ao carregar áreas. Tente novamente.', 'error');
        
        if (process.env.NODE_ENV === 'development') {
          areas.value = [
            { id: '1', nome: 'Fazenda Exemplo', cidade: 'São Paulo', estado: 'SP' }
          ];
          console.warn('Usando dados mockados para desenvolvimento');
        }
      } finally {
        loading.value = false;
      }
    }

      async function uploadTiff(payload: { farmId: string, file: File }){
        if (!payload.file || !payload.farmId) {
          showFeedback('Selecione uma fazenda e um arquivo TIFF para upload.', 'error');
          return;
        }
        const formData = new FormData();
        formData.append('file', payload.file);
        formData.append('areaId', payload.farmId);

        try{
          const response = await axios.post("http://localhost:8080/api/tiffs",formData);
          console.log('TIFF ENVIADO!', response.data);
        } catch (error) {
          console.error('Erro ao enviar TIFF', error);
        }
      }

    function openViewModal() {
      viewOpen.value = true;
    }

    function openUploadModal() {
      uploadOpen.value = true;
      selectedArea.value = null;
    }

    function openAddModal() {
      editing.value = false;
      selectedArea.value = null;
      modalOpen.value = true;
    }

    function openEditModal(area: Area) {
      editing.value = true;
      selectedArea.value = { ...area };
      modalOpen.value = true;
    }

    function closeModal() {
      modalOpen.value = false;
    }

    function confirmDelete(id: string) {
      areaToDeleteId.value = id;
      deleteDialogOpen.value = true;
    }

    async function saveArea(areaData: any) {
      saving.value = true;
      try {
        const url = editing.value && selectedArea.value?.id 
          ? `/areas/${selectedArea.value.id}` 
          : '/areas';
        const method = editing.value && selectedArea.value?.id ? 'put' : 'post';

        await api({ method, url, data: areaData });

        showFeedback(
          editing.value ? 'Área atualizada com sucesso!' : 'Área cadastrada com sucesso!',
          'success'
        );

        closeModal();
        loadAreas();
      } catch (error) {
        handleApiError(error as AxiosError);
      } finally {
        saving.value = false;
      }
    }

    async function deleteArea() {
      deleting.value = true;
      try {
        await api.delete(`/areas/${areaToDeleteId.value}`);
        showFeedback('Área excluída com sucesso!', 'success');
        loadAreas();
      } catch (error) {
        handleApiError(error as AxiosError);
      } finally {
        deleting.value = false;
        deleteDialogOpen.value = false;
      }
    }

    function handleApiError(error: AxiosError) {
      if (error.response) {
        const message = error.response.data?.message || 
                       `Erro ${error.response.status}: ${error.response.statusText}`;
        showFeedback(message, 'error');
      } else {
        showFeedback('Erro de conexão com o servidor', 'error');
      }
      console.error('Erro na API:', error);
    }

    function showFeedback(message: string, color: string) {
      snackbarMessage.value = message;
      snackbarColor.value = color;
      showSnackbar.value = true;
    }

    // Carrega as áreas quando o componente é criado
    loadAreas();

    return {
      areas,
      loading,
      modalOpen,
      deleteDialogOpen,
      viewOpen,
      editing,
      saving,
      deleting,
      selectedArea,
      showSnackbar,
      snackbarMessage,
      snackbarColor,
      uploadOpen,
      tiffFile,
      uploadTiff,
      openUploadModal,
      openAddModal,
      openEditModal,
      openViewModal,
      closeModal,
      confirmDelete,
      saveArea,
      deleteArea
    };
  }
});
</script>