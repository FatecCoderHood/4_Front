<route>
  {
    "meta": {
      "title": "Fazendas"
    }
  }
</route>

<template>
  <v-container>
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5">CADASTRO DE FAZENDAS</h2>
      </v-col>
    </v-row>

    <v-card class="mb-6">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6"></span>
        <v-btn color="primary" @click="openModal">
          <v-icon left>mdi-plus</v-icon>
          Adicionar
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="farms"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
        no-data-text="Nenhuma fazenda cadastrada"
        loading-text="Carregando fazendas..."
      >
        <template v-slot:item.produtividade="{ item }">
          {{ item.produtividade || 0 }} sacas/ha
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon color="primary" class="mr-3" @click="openEditModal(item)">
            mdi-pencil
          </v-icon>
          <v-icon color="error" @click="confirmDelete(item.id)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="modalOpen" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>{{ isEditing ? 'Editar Fazenda' : 'Cadastrar Nova Fazenda' }}</span>
          <v-btn icon @click="closeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitFarm">
            <v-text-field v-model="farm.nome" label="Nome da Fazenda" required outlined class="mb-4"></v-text-field>

            <v-select v-model="farm.localizacao" :items="allStates" label="Localização" outlined required
              class="mb-4"></v-select>

            <v-text-field v-model="farm.cultura" label="Tipo de Cultura" outlined required class="mb-4"></v-text-field>

            <v-text-field v-model="farm.produtividade" label="Produtividade (sacas/ha)" type="number" outlined required
              class="mb-4"></v-text-field>

            <v-file-input v-model="farm.geojsonFile" label="GeoJSON (upload)" accept=".geojson,.json"
              :required="!isEditing" outlined @change="handleFileUpload($event)" class="mb-4"></v-file-input>

            <v-btn type="submit" color="primary" :loading="isSubmitting" block>
              {{ isEditing ? 'Atualizar' : 'Cadastrar' }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir esta fazenda?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" text @click="deleteFarm" :loading="isDeleting">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSnackbar" :timeout="5000" :color="snackbarColor" top right>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios, { AxiosError } from 'axios';

interface Farm {
  id: string;
  nome: string;
  cultura: string;
  localizacao: string;
  produtividade: number;
  geojson: string;
  adicionado?: string;
}

interface FarmData {
  id?: string;
  nome: string;
  localizacao: string;
  cultura: string;
  produtividade: number | null;
  geojsonFile: File | null;
  geojson?: string;
}

export default defineComponent({
  data() {
    return {
      loading: false,
      modalOpen: false,
      deleteDialog: false,
      isEditing: false,
      isDeleting: false,
      farmToDelete: '',
      farms: [] as Farm[],
      farm: {
        nome: '',
        localizacao: '',
        cultura: '',
        produtividade: null,
        geojsonFile: null,
      } as FarmData,
      allStates: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO', 'NO', 'MO'
      ],
      headers: [
        { title: 'NOME DA FAZENDA', value: 'nome', align: 'center', sortable: true },
        { title: 'CULTURA', value: 'cultura', align: 'center', sortable: true },
        { title: 'LOCALIZAÇÃO', value: 'localizacao', align: 'center', sortable: true },
        { title: 'PRODUTIVIDADE (sacas/ha)', value: 'produtividade', align: 'center', sortable: true },
        { title: 'AÇÕES', value: 'actions', align: 'end', sortable: false }
      ],

      isSubmitting: false,
      showSnackbar: false,
      snackbarMessage: '',
      snackbarColor: 'green',
    };
  },

  created() {
    this.fetchFarms();
  },

  methods: {
    async fetchFarms() {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:8080/areas');
        console.log('Dados recebidos da API:', response.data);
        
        this.farms = response.data.map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          nome: item.nome || 'Fazenda sem nome',
          cultura: item.cultura || 'Cultura não informada',
          localizacao: item.localizacao || 'Local não informado',
          produtividade: Number(item.produtividade) || 0,
          geojson: item.geojson || ''
        }));
        
        console.log('Dados transformados:', this.farms);
      } catch (error) {
        console.error('Erro ao carregar fazendas:', error);
        this.showFeedback('Erro ao carregar dados das fazendas', 'error');
      } finally {
        this.loading = false;
      }
    },

    async validateGeoJSON(file: File): Promise<boolean> {
      try {
        const content = await this.readFileAsText(file);
        const parsed = JSON.parse(content);
        return parsed.type === 'FeatureCollection';
      } catch {
        return false;
      }
    },

    openModal() {
      this.isEditing = false;
      this.modalOpen = true;
    },

    openEditModal(farm: Farm) {
      this.isEditing = true;
      this.farm = {
        id: farm.id,
        nome: farm.nome,
        localizacao: farm.localizacao,
        cultura: farm.cultura,
        produtividade: farm.produtividade,
        geojsonFile: null,
        geojson: farm.geojson
      };
      this.modalOpen = true;
    },

    closeModal() {
      this.modalOpen = false;
      this.resetForm();
    },

    confirmDelete(id: string) {
      this.farmToDelete = id;
      this.deleteDialog = true;
    },

    async deleteFarm() {
      this.isDeleting = true;
      try {
        await axios.delete(`http://localhost:8080/areas/${this.farmToDelete}`);
        this.showFeedback('Fazenda excluída com sucesso!', 'green');
        await this.fetchFarms();
      } catch (error) {
        this.handleApiError(error as AxiosError);
      } finally {
        this.isDeleting = false;
        this.deleteDialog = false;
      }
    },

    handleFileUpload(event: Event) {
      const input = event.target as HTMLInputElement;
      if (!input || !input.files || input.files.length === 0) {
        this.farm.geojsonFile = null;
        return;
      }

      const file = input.files[0];
      try {
        const fileName = file.name?.toLowerCase() || '';
        const isValid = ['.geojson', '.json'].some(ext => fileName.endsWith(ext));

        if (!isValid) {
          throw new Error('Formato inválido');
        }

        this.farm.geojsonFile = file;
      } catch (error) {
        this.showFeedback('Arquivo inválido! Use .geojson ou .json', 'red');
        this.farm.geojsonFile = null;
        if (input) input.value = '';
      }
    },

    async readFileAsText(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target?.result as string);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
      });
    },

    async submitFarm() {
      this.isSubmitting = true;

      try {
        if (!this.farm.nome || !this.farm.localizacao || !this.farm.cultura || this.farm.produtividade === null) {
          this.showFeedback('Preencha todos os campos obrigatórios!', 'red');
          return;
        }

        let geojsonString = this.farm.geojson;
        if (this.farm.geojsonFile) {
          if (!await this.validateGeoJSON(this.farm.geojsonFile)) {
            this.showFeedback('GeoJSON inválido! Verifique o arquivo.', 'red');
            return;
          }
          geojsonString = await this.readFileAsText(this.farm.geojsonFile);
        }

        const payload = {
          nome: this.farm.nome,
          localizacao: this.farm.localizacao,
          cultura: this.farm.cultura,
          produtividade: Number(this.farm.produtividade),
          geojson: geojsonString
        };

        if (!this.isEditing && !geojsonString) {
          this.showFeedback('Selecione um arquivo GeoJSON válido!', 'red');
          return;
        }

        if (this.isEditing && this.farm.id) {
          await axios.put(`http://localhost:8080/areas/${this.farm.id}`, payload);
          this.showFeedback('Fazenda atualizada com sucesso!', 'green');
        } else {
          await axios.post('http://localhost:8080/areas', payload);
          this.showFeedback('Fazenda cadastrada com sucesso!', 'green');
        }

        this.closeModal();
        await this.fetchFarms();
      } catch (error) {
        console.error('Erro completo:', error);
        if (axios.isAxiosError(error)) {
          const serverError = error as AxiosError;
          if (serverError.response) {
            const errorData = serverError.response.data as any;
            const errorMessage = errorData?.message ||
              errorData?.error ||
              'Erro no servidor';
            this.showFeedback(errorMessage, 'red');
          } else {
            this.showFeedback('Sem resposta do servidor', 'red');
          }
        } else {
          this.showFeedback('Erro desconhecido', 'red');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    handleApiError(error: AxiosError) {
      if (error.response) {
        console.error('Erro na resposta:', error.response.data);
        const message = error.response.data?.message ||
          `Erro ${error.response.status}: ${error.response.statusText}`;
        this.showFeedback(message, 'red');
      } else {
        this.showFeedback('Erro de conexão com o servidor', 'red');
      }
    },

    showFeedback(message: string, color: string) {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.showSnackbar = true;
    },

    resetForm() {
      this.farm = {
        nome: '',
        localizacao: '',
        cultura: '',
        produtividade: null,
        geojsonFile: null,
      };
      this.isEditing = false;
    }
  }
});
</script>

<style scoped>
.v-icon {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.v-icon:hover {
  opacity: 1;
}

.v-card-title {
  padding: 16px;
}

.v-data-table {
  width: 100%;
  border-collapse: collapse;
}

.v-data-table-header th {
  background-color: #f5f5f5;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.875rem;
}

.v-data-table-header tr {
  height: 56px;
}

.v-data-table__wrapper {
  overflow: auto;
}

.v-card {
  overflow: visible;
}

.v-data-table tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.02);
}

.v-data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-data-table {
  background-color: #f5f5f5;
}

.v-container {
  background-color: white;
}

.v-data-table :deep(.v-data-table__td),
.v-data-table :deep(.v-data-table-header__content) {
  color: black !important;
}

.v-text-field input,
.v-select .v-select__selection-text,
.v-card-title,
.v-card-text {
  color: black !important;
}
</style>