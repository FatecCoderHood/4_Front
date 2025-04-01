<template>
  <v-container class="d-flex align-center pe-2 bg-white">
    <h1 class="text-black">Usuários</h1>

    <v-spacer></v-spacer>

    <v-text-field v-model="search" density="compact" label="Pesquisar usuários" prepend-inner-icon="mdi-magnify"
      variant="solo-filled" flat hide-details single-line clearable bg-color="white" class="text-black"></v-text-field>

    <div>
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ props }">
          <v-btn class="ma-2" icon="mdi-account-plus" color="primary" size="large" v-bind="props"
            @click="addNewItem"></v-btn>
        </template>
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
    </div>
  </v-container>

  <v-container class="bg-white">
    <v-data-table :headers="headers" :items="filteredUsers" :search="search" :items-per-page="10"
      class="elevation-1 bg-white text-black">
      <template v-slot:item.tipoAcesso="{ item }">
        <v-chip :color="getColor(item.tipoAcesso)" dark>
          {{ item.tipoAcesso }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon class="me-2 text-blue" size="small" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" class="text-red" @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </v-container>

  <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" location="top">
    <span class="text-black">{{ snackbarMessage }}</span>
  </v-snackbar>
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
        const searchTerm = this.search.toLowerCase();
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
/* Corrige a cor de fundo da tabela */
:deep(.custom-data-table) {
  background-color: #ffffff !important; /* Branco puro */
}

/* Corrige o cabeçalho */
:deep(.custom-data-table .v-data-table-header) {
  background-color: #f5f5f5 !important; /* Cinza muito claro */
}

/* Corrige as linhas */
:deep(.custom-data-table .v-data-table__tr) {
  background-color: #ffffff !important; /* Branco puro */
}

/* Corrige o hover */
:deep(.custom-data-table .v-data-table__tr:hover) {
  background-color: #f0f0f0 !important; /* Cinza bem claro no hover */
}

/* Corrige bordas */
:deep(.custom-data-table .v-data-table__td),
:deep(.custom-data-table .v-data-table-header__th) {
  border-bottom: 1px solid #e0e0e0 !important;
}

/* Mantém o texto preto */
:deep(.custom-data-table .v-data-table__td),
:deep(.custom-data-table .v-data-table-header__content) {
  color: #000000 !important;
}
</style>