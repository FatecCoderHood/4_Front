<template>   
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
         <v-btn color="#FE5000" @click="$emit('add-user')" style="color: #023047; height: 40px;">
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
        <UserTableActions
        :user="item"
        @delete="$emit('delete-user', item)"
        @edit="$emit('edit-user', item)"
        />
      </template>
    </v-data-table>
    </v-card>
</template> 

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import UserTableActions from './UserTableActions.vue';
import type { User } from '@/pages/Users.vue';


interface TipoAcesso {
  text: string;
  value: 'ADMIN' | 'CONSULTOR' | 'ANALISTA';
  color: string;
}

type DataTableHeader = {
  title: string;
  value: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
};

export default defineComponent({
    components: { UserTableActions },
    props: {
        users: {type: Object as PropType<User[]>, required: true},
        tiposAcesso: { type: Array as PropType<TipoAcesso[]>, required: true }
    },
    data(){
        return {
            searchTermNameEmailAcess: '',
            headers: [
            { title: 'Nome', value: 'nome'} ,
            { title: 'E-mail', value: 'email'},
            { title: 'Tipo de Acesso', value: 'tipoAcesso' },
            { title: 'Ações', value: 'actions', sortable: false, align: 'end' },
        ] as DataTableHeader[],
    };
  },

    computed: {
    filteredUsers() {
      const query = this.searchTermNameEmailAcess.trim().toLowerCase();
      if(!query){
        return this.users;
      }
      return this.users.filter((user: any) => {
        return (
          user.nome && user.nome.toLowerCase().includes(query) ||
          user.email && user.email.toLowerCase().includes(query) ||
          user.tipoAcesso && user.tipoAcesso.toLowerCase().includes(query)
        );
      });
    }
  },
  methods:{
    getColor(tipoAcesso: 'ADMIN' | 'CONSULTOR' | 'ANALISTA'): string {
      const tipo = this.tiposAcesso.find(t => t.value === tipoAcesso);
      return tipo ? tipo.color : 'grey';
    }
  },
  emits: ['add-user', 'edit-user', 'delete-user']
});
</script>

<style scoped>
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