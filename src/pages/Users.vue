<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2>Gestão de Usuários</h2>
      </v-col>
    </v-row>

    <v-card style="background-color: #F1FAFC;">
      <v-card-title class="d-flex justify-end align-center">
        <div class="search-container-user">
            <svg class="search-icon-user" viewBox="0 0 20 20">
              <g stroke="black" fill="none">
                <path d="M18.5 18.3l-5.4-5.4" />
                <circle r="7" cy="8" cx="8" />
              </g>
              </svg>
              <input
                v-model="searchTermNameEmailAcess"
                type="text"
                placeholder="Pesquisar usuários"
                class="search-input-user"
              />
            </div> 
         <v-btn color="#FE5000" @click="addNewItem" style="color: #023047; height: 40px;">
              <div style="width: 24px; display: flex; justify-content: center; margin-right: 4px;">
                <svg width="20px" height="20px" viewBox="0 0 24.00 24.00" fill="#023047" stroke="#023047">
                  <g id="SVGRepo_iconCarrier"> 
                    <path d="M20 18L17 18M17 18L14 18M17 18V15M17 18V21M11 21H4C4 17.134 7.13401 14 11 14C11.695 14 12.3663 14.1013 13 14.2899M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke-width="1.9" stroke-linecap="round" />
                  </g>
                </svg>
              </div>
            Novo Usuário
          </v-btn>
      </v-card-title>

      <v-data-table 
      :headers="headers" 
      :items="filteredUsers" 
      :items-per-page="10"
      class="elevation-1 text-black">
      <template v-slot:item.tipoAcesso="{ item }">
        <v-chip :color="getColor(item.tipoAcesso)" dark>
          {{ item.tipoAcesso }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <svg
              class="svg-icon"
              fill="#023047"
              width="16px"
              height="16px"
              viewBox="0 0 24.00 24.00"
              stroke="#023047"
              style="vertical-align: middle; margin-right: 2px;"
              stroke-width="0.00024000000000000003"
              @click="editItem(item)"
              >
              <path d="M20.052,3.948a3.234,3.234,0,0,1,0,4.575L18.471,10.1,13.9,5.529l1.581-1.581A3.234,3.234,0,0,1,20.052,3.948ZM8.438,20.138l8.619-8.62L12.482,6.943l-8.62,8.619L3,21Z"></path>
            </svg>
        <v-icon size="small" color="#FE5000" @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
    </v-card>

  <v-dialog v-model="dialog" max-width="500px">
        <v-card class="bg-white">
          <v-card-title class="text-black">
            <span class="text-h5">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text class="bg-white">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="editedItem.nome" label="Nome completo" required
                    class="text-black"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="editedItem.email" label="E-mail" type="email" required
                    class="text-black"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="editedItem.senha" label="Senha" type="password" required
                    class="text-black"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-select v-model="editedItem.tipoAcesso" :items="tiposAcesso" item-title="text" item-value="value"
                    label="Tipo de Acesso" required class="text-black" bg-color="white">
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :class="`text-${getColor(item.value)}`"></v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="bg-white">
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" @click="close" class="text-black">
              Cancelar
            </v-btn>
            <v-btn color="primary" variant="text" @click="save" class="text-black">
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card class="bg-white">
          <v-card-title class="text-h5 text-black">Tem certeza que deseja excluir este usuário?</v-card-title>
          <v-card-actions class="bg-white">
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="closeDelete" class="text-black">Cancelar</v-btn>
            <v-btn color="error" variant="text" @click="deleteItemConfirm" class="text-black">Excluir</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>

  <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" location="top">
    <span class="text-black">{{ snackbarMessage }}</span>
  </v-snackbar>
</v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

interface User {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  tipoAcesso: 'ADMIN' | 'CONSULTOR' | 'ANALISTA';
}

interface TipoAcessoOption {
  text: string;
  value: 'ADMIN' | 'CONSULTOR' | 'ANALISTA';
  color: string;
}

interface DataTableHeader {
  title: string;
  key: string;
  sortable?: boolean;
  class?: string;
}

export default defineComponent({
  name: 'UserManagement',

  data() {
    return {
      search: '' as string,
      dialog: false as boolean,
      dialogDelete: false as boolean,
      snackbar: false as boolean,
      searchTermNameEmailAcess:'',
      snackbarMessage: '' as string,
      snackbarColor: 'success' as string,
      headers: [
        { title: 'Nome', key: 'nome', class: 'text-black' } as DataTableHeader,
        { title: 'E-mail', key: 'email', class: 'text-black' } as DataTableHeader,
        { title: 'Tipo de Acesso', key: 'tipoAcesso', class: 'text-black' } as DataTableHeader,
        { title: 'Ações', key: 'actions', sortable: false, class: 'text-black' } as DataTableHeader,
      ],
      users: [] as User[],
      editedIndex: -1 as number,
      editedItem: {
        nome: '',
        email: '',
        senha: '',
        tipoAcesso: 'CONSULTOR'
      } as User,
      defaultItem: {
        nome: '',
        email: '',
        senha: '',
        tipoAcesso: 'CONSULTOR'
      } as User,
      tiposAcesso: [
        { text: 'Administrador', value: 'ADMIN', color: 'red' },
        { text: 'Consultor', value: 'CONSULTOR', color: 'blue' },
        { text: 'Analista', value: 'ANALISTA', color: 'green' }
      ] as TipoAcessoOption[]
    };
  },

  computed: {
    formTitle(): string {
      return this.editedIndex === -1 ? 'Novo Usuário' : 'Editar Usuário';
    },
    filteredUsers(): User[] {
      return this.users.filter(user => {
        const searchTerm = this.searchTermNameEmailAcess.toLowerCase();
        return (
          user.nome.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.tipoAcesso.toLowerCase().includes(searchTerm)
        );
      });
    }
  },

  watch: {
    dialog(val: boolean) {
      val || this.close();
    },
    dialogDelete(val: boolean) {
      val || this.closeDelete();
    },
  },

  created() {
    this.fetchUsers();
  },

  methods: {
    getColor(tipoAcesso: 'ADMIN' | 'CONSULTOR' | 'ANALISTA'): string {
      const tipo = this.tiposAcesso.find(t => t.value === tipoAcesso);
      return tipo ? tipo.color : 'grey';
    },

    async fetchUsers(): Promise<void> {
      try {
        const response = await axios.get<User[]>("http://localhost:8080/users");
        this.users = response.data;
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        this.showSnackbar("Erro ao carregar usuários", "error");
      }
    },

    addNewItem(): void {
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
      this.dialog = true;
    },

    editItem(item: User): void {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item: User): void {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm(): Promise<void> {
      try {
        await axios.delete(`http://localhost:8080/users/${this.editedItem.id}`);
        this.users.splice(this.editedIndex, 1);
        this.showSnackbar("Usuário excluído com sucesso", "success");
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        this.showSnackbar("Erro ao excluir usuário", "error");
      }
      this.closeDelete();
    },

    close(): void {
      this.dialog = false;
    },

    closeDelete(): void {
      this.dialogDelete = false;
    },

    showSnackbar(message: string, color: string): void {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },

    async save(): Promise<void> {
      try {
        if (this.editedIndex > -1) {
          await axios.put(`http://localhost:8080/users/${this.editedItem.id}`, this.editedItem);
          Object.assign(this.users[this.editedIndex], this.editedItem);
          this.showSnackbar("Usuário atualizado com sucesso", "success");
        } else {
          const response = await axios.post<User>("http://localhost:8080/users", this.editedItem);
          this.users.push(response.data);
          this.showSnackbar("Usuário criado com sucesso", "success");
        }
        this.close();
      } catch (error) {
        console.error("Erro ao salvar usuário:", error);
        this.showSnackbar("Erro ao salvar usuário", "error");
      }
    }
  },
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

.search-container-user {
    position: relative;
    margin-right: 16px;
  }

  .search-icon-user {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    pointer-events: none;
    opacity: 0.8;
  }

  .search-input-user {
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

  .search-input-user::placeholder{
    opacity: 0.6;
    font-size: 12px;
    font-weight: 450;
  }
</style>