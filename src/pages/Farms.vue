  <template>
    <v-container>
      <v-row class="mb-4">
        <v-col cols="12">
          <h2>Gestão de Fazendas</h2>
        </v-col>
      </v-row>

      
      <v-card style="background-color: #F1FAFC;">
        <v-card-title class="d-flex justify-end align-center">
          <div class="search-container-farm">
            <svg class="search-icon-farm" viewBox="0 0 20 20">
              <g stroke="black" fill="none">
                <path d="M18.5 18.3l-5.4-5.4" />
                <circle r="7" cy="8" cx="8" />
              </g>
              </svg>
              <input
                v-model="searchQueryNameLocation"
                type="text"
                placeholder="Pesquise por nome ou localização"
                class="search-input-farm"
              />
          </div> 
          <v-btn color="#FE5000" @click="openModal" style="color: #023047; height: 40px;">
          <div style="width: 24px; display: flex; justify-content: center; margin-right: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#023047" stroke-width="1.5" stroke-linecap="round">
              <path d="M12 21c-5-4.5-8-8-8-11a8 8 0 0 1 16 0c0 3-3 6.5-8 11z"></path>
              <circle cx="12" cy="10" r="3"></circle>
              <line x1="19" y1="2" x2="19" y2="8"></line>
              <line x1="16" y1="5" x2="22" y2="5"></line>
            </svg>
            </div>
            Adicionar
          </v-btn>
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="filteredFarms"
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
            <v-icon style="font-size: 16px;" color="#F6A700" class="mr-1" @click="openViewModal()">
              mdi-eye
            </v-icon>
            <svg
              class="svg-icon"
              fill="#023047"
              width="16px"
              height="16px"
              viewBox="0 0 24.00 24.00"
              stroke="#023047"
              style="vertical-align: middle; margin-right: 2px;"
              stroke-width="0.00024000000000000003"
              @click="openEditModal(item)"
              >
              <path d="M20.052,3.948a3.234,3.234,0,0,1,0,4.575L18.471,10.1,13.9,5.529l1.581-1.581A3.234,3.234,0,0,1,20.052,3.948ZM8.438,20.138l8.619-8.62L12.482,6.943l-8.62,8.619L3,21Z"></path>
            </svg>
            <v-icon color="#FE5000" style="font-size: 16px;" @click="confirmDelete(item.id)">
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

      <v-dialog v-model="viewDialog" max-width="400">
        <v-card>
          <v-card-title>
            PAGINA AINDA EM CONSTRUÇÃO!!!
          </v-card-title>
          <v-btn text @click="viewDialog = false">
            Fechar
          </v-btn>
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
        viewDialog: false,
        deleteDialog: false,
        isEditing: false,
        isDeleting: false,
        farmToDelete: '',
        searchQueryNameLocation: '',
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
          { title: 'Nome', value: 'nome', align: 'left', sortable: true },
          { title: 'Cultura', value: 'cultura', align: 'left', sortable: true },
          { title: 'Localização', value: 'localizacao', align: 'left', sortable: true },
          { title: 'Produtividade (sacas/ha)', value: 'produtividade', align: 'left', sortable: true },
          { title: 'Ações', value: 'actions', align: 'end', sortable: false }
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

    computed:{
      filteredFarms(){
        return this.farms.filter((farm) =>{
          const query = this.searchQueryNameLocation.toLowerCase();
          return (
            farm.nome.toLowerCase().includes(query) ||
            farm.localizacao.toLowerCase().includes(query)
          );
        });
      }
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

      openViewModal() {
         this.viewDialog = true;
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

.svg-icon {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.svg-icon:hover {
  opacity: 1;
}

.v-card-title {
  padding: 16px;
}

.v-data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #F1FAFC;
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

.search-container-farm {
  position: relative;
  margin-right: 16px;
}

.search-icon-farm {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  pointer-events: none;
  opacity: 0.8;
}

.search-input-farm {
  width: 380px;
  height: 40px;
  padding: 4px 4px 4px 32px; /* Espaço à esquerda pro ícone */
  border-radius: 4px;
  border: none;
  background-color: #C9DDE3;
  outline: none;
  font-size: 12px;
  font-weight: 400;
}

.search-input-farm::placeholder{
  opacity: 0.6;
  font-size: 12px;
  font-weight: 450;
}
  </style>