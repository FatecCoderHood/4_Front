<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2>Gestão de Usuários</h2>
      </v-col>
    </v-row>

    <UserList
      :users="users"
      :tipos-acesso="tiposAcesso"
      @add-user="addNewItem"
      @edit-user="editItem"
      @delete-user="deleteItem"
    />

    <UserForm
      v-model="dialog"
      :edited-item="editedItem"
      :tipos-acesso="tiposAcesso"
      :form-title="formTitle"
      @close="close"
      @save="save"
    />

    <UserDeleteDialog
      v-model="dialogDelete"
      @close="closeDelete"
      @confirm="deleteItemConfirm"
    />

    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" location="top">
      <span class="text-black">{{ snackbarMessage }}</span>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserList from '@/components/Users/UserList.vue';
import UserForm from '@/components/Users/UserForm.vue';
import UserDeleteDialog from '@/components/Users/UserDeleteDialog.vue';
import axios from 'axios';

export interface User {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  tipoAcesso: 'ADMIN' | 'CONSULTOR' | 'ANALISTA';
}

export default defineComponent({
  name: 'UserManagement',
  data() {
    return {
      dialog: false as boolean,
      dialogDelete: false as boolean,
      snackbar: false as boolean,
      snackbarMessage: '' as string,
      snackbarColor: 'success' as string,
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
      ] 
    };
  },

  computed: {
    formTitle(): string {
      return this.editedIndex === -1 ? 'Novo Usuário' : 'Editar Usuário';
    },
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